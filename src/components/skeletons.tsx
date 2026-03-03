export function GigCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-3 h-5 w-24 rounded bg-zinc-700/60" />
      <div className="mb-3 h-6 w-2/3 rounded bg-zinc-700/60" />
      <div className="mb-2 h-4 w-full rounded bg-zinc-800/80" />
      <div className="mb-4 h-4 w-5/6 rounded bg-zinc-800/80" />
      <div className="h-10 w-24 rounded-xl bg-zinc-700/60" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 h-12 w-12 rounded-full bg-zinc-700/60" />
      <div className="mb-2 h-5 w-32 rounded bg-zinc-700/60" />
      <div className="h-4 w-24 rounded bg-zinc-800/80" />
    </div>
  );
}


