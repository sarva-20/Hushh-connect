"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { pushToast } from "@/lib/toast";

type AuthResponse = {
  message: string;
  user_id: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signin">("login");

  const [identifier, setIdentifier] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batch, setBatch] = useState("");
  const [description, setDescription] = useState("");
  const [isAlumni, setIsAlumni] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnhance = async () => {
    if (!description.trim()) {
      pushToast("Enter description first", "error");
      return;
    }

    try {
      const res = await apiFetch<{ enhanced_description: string }>(
        "/users/enhance-description",
        {
          method: "POST",
          body: JSON.stringify({ description }),
        }
      );

      setDescription(res.enhanced_description);
      pushToast("Description enhanced", "success");
    } catch {
      pushToast("Enhancement failed", "error");
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response =
        mode === "login"
          ? await apiFetch<AuthResponse>("/users/login", {
              method: "POST",
              body: JSON.stringify({
                identifier: identifier.trim(),
              }),
            })
          : await apiFetch<AuthResponse>("/users/signin", {
              method: "POST",
              body: JSON.stringify({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                batch: batch.trim(),
                description: description.trim(),
                is_alumni: isAlumni,
              }),
            });

      localStorage.setItem("user_id", response.user_id);

      pushToast(response.message, "success");

      router.push("/");
    } catch (err: any) {
      pushToast(err.message || "Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-black text-white">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 p-6 bg-zinc-900">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "login" ? "Login" : "Create Account"}
        </h1>

        <div className="flex mb-4">
          <button
            className={`flex-1 p-2 ${
              mode === "login" ? "bg-orange-500 text-black" : ""
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 p-2 ${
              mode === "signin" ? "bg-orange-500 text-black" : ""
            }`}
            onClick={() => setMode("signin")}
          >
            Signin
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "login" && (
            <input
              placeholder="Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-2 bg-zinc-800 rounded"
              required
            />
          )}

          {mode === "signin" && (
            <>
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded"
                required
              />

              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded"
                required
              />

              <input
                placeholder="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded"
              />

              <input
                placeholder="Batch (e.g., 23)"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full p-2 bg-zinc-800 rounded"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isAlumni}
                  onChange={(e) =>
                    setIsAlumni(e.target.checked)
                  }
                />
                I am an Alumni
              </label>

              <textarea
                placeholder="Describe yourself..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                className="w-full p-2 bg-zinc-800 rounded"
              />

              <button
                type="button"
                onClick={handleEnhance}
                className="w-full bg-zinc-700 p-2 rounded"
              >
                Enhance with AI
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-black p-2 rounded font-semibold"
          >
            {isSubmitting
              ? "Processing..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>
      </section>
    </main>
  );
}