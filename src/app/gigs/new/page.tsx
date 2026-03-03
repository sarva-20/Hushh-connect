"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "http://127.0.0.1:8000";

export default function NewGigPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function submit() {
    await fetch(`${BACKEND}/gigs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID":
          localStorage.getItem("user_id") || "",
      },
      body: JSON.stringify({
        title,
        description,
        category: "Tech",
        price: 1000,
        deadline: new Date().toISOString(),
      }),
    });

    alert("Gig created!");
    router.push("/");
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Create Gig</h1>
      <input
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Description"
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <button onClick={submit}>Post Gig</button>
    </main>
  );
}