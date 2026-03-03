"use client";

import { useMemo, useState } from "react";

import { pushToast } from "@/lib/toast";

type PostGigModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    category: string;
    price: number;
    deadline: string;
    visibility: "public" | "private";
  }) => Promise<void>;
};

const CATEGORIES = ["Open", "Creative", "Tech", "Academic"];

export function PostGigModal({ isOpen, onClose, onSubmit }: PostGigModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = useMemo(() => title.trim() && description.trim() && Number(price) > 0 && deadline, [title, description, price, deadline]);

  if (!isOpen) {
    return null;
  }

  const suggestWithAi = () => {
    if (!description.trim()) {
      const suggestion = `Need help with ${title || "this task"} for ${category.toLowerCase()} delivery.`;
      setDescription(suggestion);
      pushToast("AI suggestion drafted from current context.", "success");
      return;
    }
    pushToast("Description already has enough detail.", "info");
  };

  const suggestFairPrice = () => {
    const base = category === "Tech" ? 900 : category === "Creative" ? 750 : category === "Academic" ? 600 : 500;
    const estimate = Math.max(base, Math.round((description.length / 120) * base));
    setPrice(String(estimate));
    pushToast(`Fair price estimate: ₹${estimate}`, "success");
  };

  const submitForm = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        deadline,
        visibility: isPublic ? "public" : "private",
      });

      setTitle("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setPrice("");
      setDeadline("");
      setIsPublic(true);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
      <div className="glass-card w-full max-w-xl rounded-2xl border border-[#1f1f1f] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Post a Gig</h2>
          <button className="rounded-lg border border-zinc-700 px-3 py-1 text-zinc-300 hover:border-orange-500/50" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid gap-4">
          <label className="text-sm text-zinc-300">
            Title
            <input
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Need Figma prototype for club app"
            />
          </label>

          <label className="text-sm text-zinc-300">
            Description
            <textarea
              className="mt-1 h-28 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add context, deliverables, and expected timeline."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Category
              <select
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-zinc-300">
              Price (INR)
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="500"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Deadline
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none ring-orange-500/40 focus:ring"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </label>

            <label className="text-sm text-zinc-300">
              Visibility
              <button
                type="button"
                onClick={() => setIsPublic((prev) => !prev)}
                className="mt-1 flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              >
                <span>{isPublic ? "Public" : "Private"}</span>
                <span className={`h-4 w-8 rounded-full ${isPublic ? "bg-orange-500" : "bg-zinc-600"}`} />
              </button>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={suggestWithAi} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-orange-500/50">
            Suggest with AI
          </button>
          <button onClick={suggestFairPrice} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:border-orange-500/50">
            Fair Price
          </button>
          <button
            disabled={!isValid || isSubmitting}
            onClick={submitForm}
            className="ml-auto rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition enabled:hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
          >
            {isSubmitting ? "Posting..." : "Post Gig - Earn 50 XP"}
          </button>
        </div>
      </div>
    </div>
  );
}


