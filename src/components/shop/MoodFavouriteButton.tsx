"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function MoodFavouriteButton({ moodId }: { moodId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/favorites", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setSaved(Array.isArray(data?.favoriteMoodIds) && data.favoriteMoodIds.includes(moodId)))
      .catch(() => {});
  }, [moodId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/favorites", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mood", id: moodId }),
      });
      if (response.status === 401) {
        window.location.href = "/account";
        return;
      }
      if (!response.ok) return;
      const next = !saved;
      setSaved(next);
      window.dispatchEvent(new CustomEvent("imc:favourite-changed", {
        detail: { type: "mood", id: moodId, favorite: next },
      }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove mood from favourites" : "Add mood to favourites"}
      aria-pressed={saved}
      className={"group absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 backdrop-blur-md transition-all hover:-translate-y-0.5 md:right-8 md:top-8 " + (saved ? "bg-[#f6f1e9] text-[#9c5638]" : "bg-white/10 text-white hover:bg-white/20")}
    >
      <Heart size={22} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} className="transition-transform duration-200 group-hover:scale-105" />
    </button>
  );
}
