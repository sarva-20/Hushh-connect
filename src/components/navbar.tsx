"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavbarProps = {
  onPostGig: () => void;
};

export function Navbar({ onPostGig }: NavbarProps) {
  const [compactTheme, setCompactTheme] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("compact_theme");
    const storedUser = window.localStorage.getItem("user_id");
    if (saved === "1") {
      setCompactTheme(true);
      document.body.classList.add("contrast-125");
    }
    setUserId(storedUser);
  }, []);

  const toggleTheme = () => {
    const next = !compactTheme;
    setCompactTheme(next);
    if (next) {
      window.localStorage.setItem("compact_theme", "1");
      document.body.classList.add("contrast-125");
    } else {
      window.localStorage.removeItem("compact_theme");
      document.body.classList.remove("contrast-125");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl text-orange-500">⚡</span>
          <span className="font-bold tracking-tight text-white">Hushh Connect</span>
        </div>

        <div className="hidden items-center gap-6 text-sm text-zinc-300 sm:flex">
          <Link className="transition hover:text-orange-300" href="/">
            Feed
          </Link>
          <Link className="transition hover:text-orange-300" href="/profile">
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle visual mode"
            onClick={toggleTheme}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 transition hover:border-orange-500/50"
          >
            {compactTheme ? "Dark" : "Focus"}
          </button>
          {userId ? (
            <button
              aria-label="Logout"
              onClick={() => {
                window.localStorage.removeItem("user_id");
                setUserId(null);
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 transition hover:border-orange-500/50"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 transition hover:border-orange-500/50"
            >
              Login
            </Link>
          )}
          <button
            onClick={onPostGig}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-orange-400"
          >
            + Post a Gig
          </button>
        </div>
      </nav>
    </header>
  );
}


