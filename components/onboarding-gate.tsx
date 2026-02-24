"use client";

import { useEffect, useState } from "react";
import { OnboardingWalkthrough } from "./onboarding-walkthrough";

export const SHOW_ONBOARDING_EVENT = "gnr8-show-onboarding";

type Me = {
  role: string;
  clientProfile?: { onboardingCompletedAt: string | null } | null;
};

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    function fetchMe() {
      fetch("/api/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((me: Me | null) => {
          if (cancelled || !me) return;
          if (me.role !== "client") {
            setShowOnboarding(false);
            return;
          }
          const completed = me.clientProfile?.onboardingCompletedAt != null;
          setShowOnboarding(!completed);
        })
        .catch(() => setShowOnboarding(false));
    }
    fetchMe();
    const handler = () => setShowOnboarding(true);
    window.addEventListener(SHOW_ONBOARDING_EVENT, handler);
    return () => {
      cancelled = true;
      window.removeEventListener(SHOW_ONBOARDING_EVENT, handler);
    };
  }, []);

  async function complete() {
    const res = await fetch("/api/me/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    if (res.ok) setShowOnboarding(false);
  }

  if (showOnboarding === null) return <>{children}</>;
  if (showOnboarding)
    return (
      <>
        <OnboardingWalkthrough onComplete={complete} onSkip={complete} />
        {children}
      </>
    );
  return <>{children}</>;
}
