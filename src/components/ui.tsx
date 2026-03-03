import { initials } from "@/lib/ui";

export function Avatar({
  name,
  size = "md",
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-base" : "h-10 w-10 text-sm";

  return (
    <div
      className={`inline-flex ${sizeClass} items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/20 font-semibold text-orange-200`}
    >
      {initials(name)}
    </div>
  );
}

export function StarRating({ rating = 0 }: { rating?: number }) {
  const normalized = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} className={idx < normalized ? "text-orange-400" : "text-zinc-600"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ScoreRing({ score = 0 }: { score?: number }) {
  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  const circumference = 2 * Math.PI * 28;
  const offset = circumference * (1 - bounded / 100);

  return (
    <div className="relative h-20 w-20">
      <svg className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r="28" stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="transparent" />
        <circle
          cx="40"
          cy="40"
          r="28"
          stroke="#f97316"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-orange-200">{bounded}%</div>
    </div>
  );
}

export function XpBar({ value = 0 }: { value?: number }) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
        <span>XP Level</span>
        <span>{Math.round(bounded)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300" style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}


