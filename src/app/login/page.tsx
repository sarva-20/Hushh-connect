// page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { pushToast } from "@/lib/toast";

type LoginResponse = {
  message: string;
  user_id: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signin">("login");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setInlineError(null);
    try {
      const response =
        mode === "login"
          ? await apiFetch<LoginResponse>("/users/login", {
              method: "POST",
              body: JSON.stringify({ identifier: identifier.trim() }),
            })
          : await apiFetch<LoginResponse>("/users/signin", {
              method: "POST",
              body: JSON.stringify({
                user_id: userId.trim(),
                name: name.trim(),
                email: email.trim(),
                college_id: "kpriet",
                department: department.trim(),
                year: year.trim(),
              }),
            });

      localStorage.setItem("user_id", response.user_id);
      pushToast(mode === "login" ? "Login successful" : "Account created successfully", "success");
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 0) {
          setInlineError("Backend is offline. Start FastAPI on http://127.0.0.1:8000 and try again.");
        } else if (error.status === 404) {
          setInlineError("Auth endpoint not found. Restart backend so latest /users/login and /users/signin routes are loaded.");
        } else {
          setInlineError(error.message);
        }
      } else {
        setInlineError("Something went wrong. Please retry.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="glass-card w-full max-w-md rounded-2xl border border-[#1f1f1f] p-6">
        <h1 className="text-3xl font-extrabold text-white">Welcome</h1>
        <p className="mt-2 text-sm text-zinc-400">Log in or create a new account.</p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-orange-500 text-black" : "text-zinc-300"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`rounded-lg px-3 py-2 text-sm ${mode === "signin" ? "bg-orange-500 text-black" : "text-zinc-300"}`}
          >
            Sign In
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {inlineError ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{inlineError}</div>
          ) : null}

          {mode === "login" ? (
            <label className="block text-sm text-zinc-300">
              User ID or Email
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                placeholder="user_1 or name@college.edu"
                required
              />
            </label>
          ) : (
            <>
              <label className="block text-sm text-zinc-300">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="block text-sm text-zinc-300">
                User ID
                <input
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                  placeholder="user_123"
                  required
                />
              </label>
              <label className="block text-sm text-zinc-300">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                  placeholder="name@college.edu"
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-zinc-300">
                  Department
                  <input
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                    placeholder="CSE"
                  />
                </label>
                <label className="block text-sm text-zinc-300">
                  Year
                  <input
                    value={year}
                    onChange={(event) => setYear(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                    placeholder="3rd Year"
                  />
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-orange-500 px-4 py-2 font-semibold text-black transition enabled:hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
          >
            {isSubmitting ? (mode === "login" ? "Logging in..." : "Creating account...") : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </section>
    </main>
  );
}
