"use client";

import { useEffect, useMemo, useState } from "react";

import { Navbar } from "@/components/navbar";
import { ProfileSkeleton } from "@/components/skeletons";
import { Avatar, ScoreRing, StarRating } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { Gig, User } from "@/lib/types";
import { formatDate } from "@/lib/ui";

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl border border-[#1f1f1f] p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-orange-300">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const userId = window.localStorage.getItem("user_id");
        if (!userId) {
          setUser(null);
          setGigs([]);
          return;
        }

        const [userData, allGigs] = await Promise.all([apiFetch<User>(`/users/${userId}`), apiFetch<Gig[]>("/gigs")]);
        setUser(userData);
        setGigs(Array.isArray(allGigs) ? allGigs : []);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const postedGigs = useMemo(
    () => gigs.filter((gig) => gig.posted_by === user?.user_id).slice(0, 6),
    [gigs, user?.user_id],
  );

  const latestCompleted = useMemo(
    () => gigs.find((gig) => gig.assigned_to === user?.user_id && gig.status === "completed"),
    [gigs, user?.user_id],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar onPostGig={() => setShowPostModal(true)} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-extrabold">Profile Dashboard</h1>
        <p className="mt-1 text-zinc-400">Track your XP, completed gigs, and proof of work.</p>

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ProfileSkeleton />
            <ProfileSkeleton />
            <ProfileSkeleton />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatsCard label="Total XP" value={String(user?.total_xp ?? user?.xp ?? 0)} />
            <StatsCard label="Gigs Done" value={String(user?.total_gigs_completed ?? 0)} />
            <StatsCard label="Rating" value={(user?.rating ?? 0).toFixed(1)} />
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-2xl border border-[#1f1f1f] p-5">
            <h2 className="text-xl font-semibold text-white">Gigs posted</h2>
            <div className="mt-4 space-y-3">
              {postedGigs.length === 0 ? (
                <p className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">No gigs posted yet.</p>
              ) : (
                postedGigs.map((gig) => (
                  <div key={gig.gig_id ?? gig._id ?? gig.title} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                    <p className="font-semibold text-white">{gig.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{gig.description}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="glass-card rounded-2xl border border-orange-500/40 p-5 shadow-[0_0_35px_rgba(249,115,22,0.18)]">
            <h2 className="text-xl font-semibold text-white">Proof of Work</h2>
            {user ? (
              <div className="mt-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} />
                  <div>
                    <p className="font-semibold text-zinc-100">{user.name ?? user.user_id}</p>
                    <p className="text-sm text-zinc-400">Completion verified</p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm text-zinc-300">
                  <p>
                    <span className="text-zinc-500">Gig title:</span> {latestCompleted?.title ?? "No completed gig yet"}
                  </p>
                  <p>
                    <span className="text-zinc-500">Skill used:</span> {latestCompleted?.skill_used ?? latestCompleted?.skills?.[0] ?? "Pending"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Rating:</span> <StarRating rating={user.rating ?? 0} />
                  </div>
                  <p>
                    <span className="text-zinc-500">Completion date:</span>{" "}
                    {formatDate(latestCompleted?.completed_at ?? latestCompleted?.updated_at)}
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                    <span className="text-zinc-400">Job Readiness Score</span>
                    <ScoreRing score={user.job_readiness_score ?? 0} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
                Login required to view profile details.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}


