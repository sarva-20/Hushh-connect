"use client";

import { useEffect, useState } from "react";

import { GigCard } from "@/components/gig-card";
import { Navbar } from "@/components/navbar";
import { PostGigModal } from "@/components/post-gig-modal";
import { GigCardSkeleton, ProfileSkeleton } from "@/components/skeletons";
import { Avatar, ScoreRing, XpBar } from "@/components/ui";
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
    <aside className="glass-card rounded-2xl border border-[#1f1f1f] p-5 space-y-6">
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

      {/* Wallet Section */}
      <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <p className="text-xs text-zinc-500 mb-1">
          Wallet Balance
        </p>
        <p className="text-2xl font-bold text-orange-400">
          ₹{user?.wallet_balance ?? 0}
        </p>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">
          Job Readiness
        </p>
        <ScoreRing score={user?.job_readiness_score ?? 0} />
      </div>

      <XpBar
        value={Math.min(
          100,
          ((user?.total_xp ?? 0) / 2000) * 100
        )}
      />
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
          <div key={u.user_id} className="flex justify-between mb-3">
            <span>
              #{index + 1} {u.name}
            </span>
            <span className="text-sm text-zinc-400">
              {u.total_gigs_completed ?? 0}
            </span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          🚀 Top Requesters
        </h3>
        {requesters.map((u, index) => (
          <div key={u.user_id} className="flex justify-between mb-3">
            <span>
              #{index + 1} {u.name}
            </span>
            <span className="text-sm text-zinc-400">
              {u.total_gigs_posted ?? 0}
            </span>
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

  const [activeBidGig, setActiveBidGig] =
    useState<GigWithScore | null>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  const [bidsMap, setBidsMap] =
    useState<Record<string, Bid[]>>({});

  const fetchData = async () => {
    setLoading(true);

    const storedUserId =
      window.localStorage.getItem("user_id");

    try {
      // Fetch gigs and leaderboard with error handling
      let gigsData: Gig[] = [];
      let leaderboardData: User[] = [];
      let userData: User | null = null;
      let suggestionsData: SuggestionsResponse | null =
        null;

      try {
        gigsData = await apiFetch<Gig[]>("/gigs");
      } catch (err) {
        console.error("Failed to fetch gigs:", err);
        gigsData = [];
      }

      try {
        leaderboardData = await apiFetch<User[]>(
          "/leaderboard/"
        );
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        leaderboardData = [];
      }

      if (storedUserId) {
        try {
          userData = await apiFetch<User>(
            `/users/${storedUserId}`
          );
        } catch (err) {
          console.error(
            "Failed to fetch user data:",
            err
          );
          userData = null;
        }

        try {
          suggestionsData =
            await apiFetch<SuggestionsResponse>(
              `/ai/suggestions/${storedUserId}`
            );
        } catch (err) {
          console.error(
            "Failed to fetch suggestions:",
            err
          );
          suggestionsData = null;
        }
      }

      let finalGigs: GigWithScore[] = gigsData || [];

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
      setUsers(leaderboardData || []);
      setCurrentUser(userData);

      // Fetch bids for owned gigs
      if (storedUserId) {
        const newBidsMap: Record<string, Bid[]> = {};

        for (const gig of finalGigs) {
          if (gig.posted_by === storedUserId) {
            try {
              const bids = await apiFetch<Bid[]>(
                `/gigs/${gig.gig_id}/bids`
              );
              newBidsMap[gig.gig_id] = bids;
            } catch {
              newBidsMap[gig.gig_id] = [];
            }
          }
        }

        setBidsMap(newBidsMap);
      }
    } catch (err) {
      console.error("Unexpected error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const openBidModal = (gig: GigWithScore) => {
    if (!currentUser) {
      pushToast("Please login to bid", "error");
      return;
    }

    if (gig.posted_by === currentUser.user_id) {
      pushToast("You cannot bid on your own gig", "error");
      return;
    }

    setActiveBidGig(gig);
  };

  const submitBid = async () => {
    if (!activeBidGig) return;

    try {
      await apiFetch(`/gigs/${activeBidGig.gig_id}/bid`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          bid_price: Number(bidPrice),
          message: bidMessage,
        }),
      });

      pushToast("Bid submitted", "success");
      setActiveBidGig(null);
      setBidPrice("");
      setBidMessage("");
      await fetchData();
    } catch (err: any) {
      pushToast(err.message || "Bid failed", "error");
    }
  };

  const completeGig = async (gigId: string) => {
    await apiFetch(`/gigs/${gigId}/complete`, {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        rating: 5,
        review: "Great work",
        skill_used: "general",
      }),
    });

    pushToast("Gig completed!", "success");
    await fetchData();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar onPostGig={() => setShowPostModal(true)} />

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[280px_minmax(0,1fr)_320px] sm:px-6">
        <ProfileSidebar user={currentUser} loading={loading} />

        <section className="space-y-4">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <GigCardSkeleton key={idx} />
              ))
            : gigs.map((gig) => (
                <div key={gig.gig_id}>
                  <GigCard
                    gig={gig}
                    provider={users.find(
                      (u) => u.user_id === gig.posted_by
                    )}
                    onConnect={() => openBidModal(gig)}
                    connectingGigId={null}
                  />

                  {/* Show bids if owner */}
                  {gig.posted_by === currentUser?.user_id &&
                    bidsMap[gig.gig_id]?.map((bid) => (
                      <div
                        key={bid.bid_id}
                        className="mt-3 p-3 bg-zinc-800 rounded"
                      >
                        <p>
                          <strong>{bid.user_name}</strong> bid ₹
                          {bid.bid_price}
                        </p>
                        <p className="text-sm text-zinc-400 mb-2">
                          {bid.message}
                        </p>

                        {gig.status === "open" && (
                          <button
                            className="bg-green-600 px-3 py-1 rounded text-sm mr-2"
                            onClick={async () => {
                              await apiFetch(
                                `/gigs/${gig.gig_id}/accept/${bid.bid_id}`,
                                { method: "POST", auth: true }
                              );
                              pushToast("Bid accepted", "success");
                              await fetchData();
                            }}
                          >
                            Accept
                          </button>
                        )}

                        {gig.status === "assigned" &&
                          gig.assigned_to === bid.user_id && (
                            <button
                              className="bg-blue-600 px-3 py-1 rounded text-sm"
                              onClick={() =>
                                completeGig(gig.gig_id)
                              }
                            >
                              Complete Gig
                            </button>
                          )}
                      </div>
                    ))}
                </div>
              ))}
        </section>

        <Leaderboards users={users} />
      </main>

      {/* BID MODAL */}
      {activeBidGig && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-xl w-96">
            <h2 className="text-lg font-semibold mb-4">
              Submit Bid
            </h2>

            <input
              type="number"
              placeholder="Your bid price"
              value={bidPrice}
              onChange={(e) => setBidPrice(e.target.value)}
              className="w-full mb-3 p-2 bg-zinc-800 rounded"
            />

            <textarea
              placeholder="Your commitment..."
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
              className="w-full mb-3 p-2 bg-zinc-800 rounded"
            />

            <button
              onClick={submitBid}
              className="bg-orange-500 w-full py-2 rounded text-black font-semibold"
            >
              Submit Bid
            </button>
          </div>
        </div>
      )}

      <PostGigModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
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