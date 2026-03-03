import type { Gig } from "@/lib/types";

export function getGigId(gig: Gig): string {
  return gig.gig_id ?? gig._id ?? "";
}

export function formatMoney(amount?: number): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date?: string): string {
  if (!date) {
    return "No deadline";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "No deadline";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function normalizedTags(gig: Gig): string[] {
  return gig.skill_tags ?? gig.skills ?? [];
}

export function categoryStyles(category?: string): string {
  const key = (category ?? "").toLowerCase();
  if (key.includes("creative")) {
    return "bg-purple-500/20 text-purple-300 border-purple-400/40";
  }
  if (key.includes("tech")) {
    return "bg-sky-500/20 text-sky-300 border-sky-400/40";
  }
  if (key.includes("academic")) {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-400/40";
  }
  return "bg-orange-500/20 text-orange-200 border-orange-500/50";
}

export function statusStyles(status?: string): string {
  const key = (status ?? "").toLowerCase();
  if (key === "open") {
    return "bg-orange-500/20 text-orange-200 border-orange-500/50";
  }
  if (key === "assigned") {
    return "bg-sky-500/20 text-sky-300 border-sky-500/40";
  }
  if (key === "completed") {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  }
  return "bg-zinc-700/40 text-zinc-300 border-zinc-600/70";
}

export function initials(name?: string): string {
  const parts = (name ?? "HC")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "HC";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
