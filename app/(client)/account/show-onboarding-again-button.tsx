"use client";

import { useState } from "react";
import { SHOW_ONBOARDING_EVENT } from "@/components/onboarding-gate";

export function ShowOnboardingAgainButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/me/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      });
      window.dispatchEvent(new CustomEvent(SHOW_ONBOARDING_EVENT));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 disabled:opacity-50"
    >
      {loading ? "Loading…" : "Show onboarding again"}
    </button>
  );
}
