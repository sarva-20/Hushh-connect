// api.ts
import { pushToast } from "@/lib/toast";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiOptions = RequestInit & {
  auth?: boolean;
  userId?: string;
};

function getStoredUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("user_id");
}

function toPath(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const envBase = BACKEND_BASE_URL.trim();

  if (envBase && !envBase.includes("YOUR_BACKEND_URL")) {
    return `${envBase.replace(/\/+$/, "")}${cleanPath}`;
  }

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return `http://127.0.0.1:8000${cleanPath}`;
  }

  return `http://127.0.0.1:8000${cleanPath}`;
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = false, userId, headers, ...rest } = options;

  const mergedHeaders = new Headers(headers);
  mergedHeaders.set("Accept", "application/json");

  if (rest.body && !mergedHeaders.has("Content-Type")) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const resolvedUserId = userId ?? getStoredUserId();
    if (!resolvedUserId) {
      const error = new ApiError("Missing user session. Please login again.", 401, null);
      pushToast(error.message, "error");
      throw error;
    }
    mergedHeaders.set("X-User-ID", resolvedUserId);
  }

  const targetUrl = toPath(path);

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...rest,
      headers: mergedHeaders,
      cache: "no-store",
    });
  } catch (error) {
    // Common local setup issue: localhost resolves differently on some machines.
    if (targetUrl.includes("localhost:8000")) {
      const fallbackUrl = targetUrl.replace("localhost:8000", "127.0.0.1:8000");
      try {
        response = await fetch(fallbackUrl, {
          ...rest,
          headers: mergedHeaders,
          cache: "no-store",
        });
      } catch {
        const networkError = new ApiError(
          `Cannot reach backend at ${targetUrl}. Check NEXT_PUBLIC_BACKEND_URL and ensure FastAPI is running.`,
          0,
          { cause: error instanceof Error ? error.message : String(error) },
        );
        pushToast(networkError.message, "error");
        throw networkError;
      }
    } else {
      const networkError = new ApiError(
        `Cannot reach backend at ${targetUrl}. Check NEXT_PUBLIC_BACKEND_URL and ensure FastAPI is running.`,
        0,
        { cause: error instanceof Error ? error.message : String(error) },
      );
      pushToast(networkError.message, "error");
      throw networkError;
    }
  }

  const rawBody = await response.text();
  let parsedPayload: unknown = null;
  if (rawBody) {
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      parsedPayload = rawBody;
    }
  }

  if (!response.ok) {
    const message = parseErrorMessage(parsedPayload, `Request failed (${response.status})`);
    const error = new ApiError(message, response.status, parsedPayload);
    pushToast(message, "error");
    throw error;
  }

  return parsedPayload as T;
}
