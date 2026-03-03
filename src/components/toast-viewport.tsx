"use client";

import { useEffect, useState } from "react";

import { getToastEventName } from "@/lib/toast";
import type { ToastMessage } from "@/lib/types";

const TOAST_TIMEOUT_MS = 3400;

export function ToastViewport() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ToastMessage>;
      const message = customEvent.detail;
      if (!message) {
        return;
      }

      setMessages((prev) => [...prev, message]);
      window.setTimeout(() => {
        setMessages((prev) => prev.filter((item) => item.id !== message.id));
      }, TOAST_TIMEOUT_MS);
    };

    window.addEventListener(getToastEventName(), handler as EventListener);
    return () => {
      window.removeEventListener(getToastEventName(), handler as EventListener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(92vw,360px)] flex-col gap-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${
            message.type === "error"
              ? "border-red-500/40 bg-red-500/20 text-red-100"
              : message.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-100"
                : "border-orange-500/40 bg-orange-500/20 text-orange-100"
          }`}
        >
          {message.message}
        </div>
      ))}
    </div>
  );
}


