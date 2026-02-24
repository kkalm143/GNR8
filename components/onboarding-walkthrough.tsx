"use client";

import { useState } from "react";

const STEPS = [
  { title: "Welcome", body: "Welcome to Genr8. Your coach uses this app to assign programs and stay in touch." },
  { title: "Today is your hub", body: "The Today screen shows what's on your schedule and quick links to programs and progress." },
  { title: "Programs are here", body: "Open Programs to see assigned workouts and content from your coach." },
  { title: "Log progress here", body: "Use Progress to log notes, workouts, body metrics, and photos." },
];

type OnboardingWalkthroughProps = {
  onComplete: () => void;
  onSkip?: () => void;
};

export function OnboardingWalkthrough({ onComplete, onSkip }: OnboardingWalkthroughProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (isLast) onComplete();
    else setStep((s) => s + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-zinc-50">{current.title}</h2>
        <p className="mt-3 text-zinc-300">{current.body}</p>
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === step ? "bg-[var(--brand)]" : "bg-zinc-600"}`}
                aria-hidden
              />
            ))}
          </div>
          <div className="flex gap-2">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-50"
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {isLast ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
