import type { ToastMessage } from "@/lib/types";

const EVENT_NAME = "hushh-toast";

export function pushToast(message: string, type: ToastMessage["type"] = "info"): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ToastMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    type,
  };

  window.dispatchEvent(new CustomEvent<ToastMessage>(EVENT_NAME, { detail: payload }));
}

export function getToastEventName(): string {
  return EVENT_NAME;
}
