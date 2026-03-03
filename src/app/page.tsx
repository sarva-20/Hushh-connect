"use client";

import { useEffect, useMemo, useState } from "react";

import { GigCard } from "@/components/gig-card";
import { Navbar } from "@/components/navbar";
import { PostGigModal } from "@/components/post-gig-modal";
import { GigCardSkeleton, ProfileSkeleton } from "@/components/skeletons";
import { Avatar, ScoreRing, StarRating, XpBar } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { pushToast } from "@/lib/toast";
import type { Gig, User } from "@/lib/types";

type Suggestion = {
  gig_id: string;
  score: number;
};

type SuggestionsResponse = {
  suggestions: Suggestion[];
};

type Bid = {
  bid_id: string;
  gig_id: string;
  user_id: string;
  user_name?: string;
  status: string;
  bid_price: number;
  message: string;
};

type GigWithScore = Gig & {
  ai_score?: number;
};

function ProfileSidebar({
  user,
  loading,
}: {
  user: User | null;
  loading: boolean;
}) {
  if (loading) return <ProfileSkeleton />;

  return (
    <aside className="glass-card rounded-2xl border border-[#1f1f1f] p-5">
      <div className="flex items-center gap-3">
        <Avatar name={user?.name} size="lg" />
        <div>
          <p className="font-semibold text-white">
            {user?.name ?? "Campus User"}
          </p>
          <p className="text-sm text-zinc-400">
            {(user?.department ?? "Department") +
              (user?.year ? ` · ${user.year}` : "")}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Job Readiness
        </p>
        <ScoreRing score={user?.job_readiness_score ?? 0} />
      </div>

      <div className="mt-5">
        <XpBar
          value={Math.min(
            100,
            ((user?.total_xp ?? 0) / 2000) * 100
          )}
        />
      </div>
    </aside>
  );
}

function Leaderboards({ users }: { users: User[] }) {
  const providers = [...users]
    .sort(
      (a, b) =>
        (b.total_gigs_completed ?? 0) -
        (a.total_gigs_completed ?? 0)
    )
    .slice(0, 5);

  const requesters = [...users]
    .sort(
      (a, b) =>
        (b.total_gigs_posted ?? 0) -
        (a.total_gigs_posted ?? 0)
    )
    .slice(0, 5);

  return (
    <aside className="glass-card rounded-2xl border border-[#1f1f1f] p-5 space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          🏆 Top Providers
        </h3>
        {providers.map((u, index) => (
          <div
            key={u.user_id}
            className="flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold">
                #{index + 1}
              </span>
              <span>{u.name}</span>
            </div>
            <div className="text-sm text-zinc-400">
              {u.total_gigs_completed ?? 0} gigs
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          🚀 Top Requesters
        </h3>
        {requesters.map((u, index) => (
          <div
            key={u.user_id}
            className="flex justify-between items-center mb-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold">
                #{index + 1}
              </span>
              <span>{u.name}</span>
            </div>
            <div className="text-sm text-zinc-400">
              {u.total_gigs_posted ?? 0} posted
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function HomePage() {
  const [gigs, setGigs] = useState<GigWithScore[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] =
    useState<User | null>(null);
  const [loading, setLoading] =
    useState<boolean>(true);
  const [showPostModal, setShowPostModal] =
    useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);

    const storedUserId =
      window.localStorage.getItem("user_id");

    const [
      gigsData,
      leaderboardData,
      userData,
      suggestionsData,
    ] = await Promise.all([
      apiFetch<Gig[]>("/gigs"),
      apiFetch<User[]>("/leaderboard/"),
      storedUserId
        ? apiFetch<User>(
            `/users/${storedUserId}`
          )
        : Promise.resolve(null),
      storedUserId
        ? apiFetch<SuggestionsResponse>(
            `/ai/suggestions/${storedUserId}`
          )
        : Promise.resolve(null),
    ]);

    let finalGigs: GigWithScore[] =
      Array.isArray(gigsData) ? gigsData : [];

    if (
      suggestionsData &&
      Array.isArray(suggestionsData.suggestions)
    ) {
      const scoreMap = new Map<string, number>();

      suggestionsData.suggestions.forEach((s) =>
        scoreMap.set(s.gig_id, s.score)
      );

      finalGigs = finalGigs
        .map((g) => ({
          ...g,
          ai_score: scoreMap.get(g.gig_id) ?? 0,
        }))
        .sort(
          (a, b) =>
            (b.ai_score ?? 0) -
            (a.ai_score ?? 0)
        );
    }

    setGigs(finalGigs);
    setUsers(leaderboardData ?? []);
    setCurrentUser(userData);

    setLoading(false);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar onPostGig={() => setShowPostModal(true)} />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)_320px] sm:px-6">
        <ProfileSidebar
          user={currentUser}
          loading={loading}
        />

        <section className="space-y-4">
          {loading
            ? Array.from({ length: 4 }).map(
                (_, idx) => (
                  <GigCardSkeleton key={idx} />
                )
              )
            : gigs.map((gig) => (
                <div key={gig.gig_id}>
                  {gig.ai_score &&
                    gig.ai_score > 0 && (
                      <div className="text-xs text-green-400 mb-1">
                        🤖 AI Match:{" "}
                        {(
                          gig.ai_score * 100
                        ).toFixed(0)}
                        %
                      </div>
                    )}

                  <GigCard
                    gig={gig}
                    provider={users.find(
                      (u) =>
                        u.user_id ===
                        gig.posted_by
                    )}
                    onConnect={() => {}}
                    connectingGigId={null}
                  />
                </div>
              ))}
        </section>

        <Leaderboards users={users} />
      </main>

      <PostGigModal
        isOpen={showPostModal}
        onClose={() =>
          setShowPostModal(false)
        }
        onSubmit={async (payload) => {
          await apiFetch("/gigs", {
            method: "POST",
            auth: true,
            body: JSON.stringify(payload),
          });
          pushToast("Gig created", "success");
          await fetchData();
        }}
      />
    </div>
  );
}