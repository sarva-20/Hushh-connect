"use client";

import { useEffect, useState } from "react";

const BACKEND = "http://127.0.0.1:8000";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BACKEND}/leaderboard/`)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <main style={{ padding: 30 }}>
      <h1>Leaderboard</h1>
      {users.map((u, i) => (
        <div key={u.user_id}>
          #{i + 1} {u.name} — Score: {u.job_readiness_score}
        </div>
      ))}
    </main>
  );
}