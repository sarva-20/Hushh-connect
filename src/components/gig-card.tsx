import type { Gig, User } from "@/lib/types";
import { categoryStyles, formatDate, formatMoney, getGigId, normalizedTags, statusStyles } from "@/lib/ui";
import { Avatar, StarRating } from "@/components/ui";

type GigCardProps = {
  gig: Gig;
  provider?: User;
  onConnect: (gigId: string) => Promise<void>;
  connectingGigId?: string | null;
};

export function GigCard({ gig, provider, onConnect, connectingGigId }: GigCardProps) {
  const gigId = getGigId(gig);
  const tags = normalizedTags(gig);
  const providerName = gig.postedBy?.name ?? provider?.name ?? "Campus User";
  const providerRating = gig.postedBy?.rating ?? provider?.rating ?? 0;
  const isBusy = connectingGigId === gigId;

  return (
    <article className="glass-card soft-border-glow rounded-2xl border border-[#1f1f1f] p-5 transition duration-200 hover:scale-[1.01]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyles(gig.category)}`}>
          {gig.category ?? "OPEN"}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles(gig.status)}`}>
          {(gig.status ?? "open").toUpperCase()}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-white">{gig.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-300">{gig.description ?? "No description provided."}</p>

      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-2 py-1 text-xs text-zinc-300">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Price</p>
          <p className="text-sm font-semibold text-orange-300">{formatMoney(gig.price)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Deadline</p>
          <p className="text-sm font-medium text-zinc-200">{formatDate(gig.deadline)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Gig ID</p>
          <p className="truncate text-sm font-medium text-zinc-200">{gigId || "Unavailable"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={providerName} />
          <div>
            <p className="text-sm font-semibold text-zinc-100">{providerName}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={providerRating} />
              <span className="text-xs text-zinc-400">{providerRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onConnect(gigId)}
          disabled={!gigId || isBusy}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition enabled:hover:scale-[1.02] enabled:hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
        >
          {isBusy ? "Connecting..." : "Connect"}
        </button>
      </div>
    </article>
  );
}


