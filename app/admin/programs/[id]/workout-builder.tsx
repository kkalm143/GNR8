"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Exercise = { id: string; name: string };
type Set = {
  id: string;
  reps: string | null;
  repRange: string | null;
  weight: string | null;
  setType: string;
  customLabel: string | null;
  exercise: { id: string; name: string } | null;
};
type Section = {
  id: string;
  type: string;
  name: string | null;
  durationSeconds: number | null;
  sets: Set[];
};

export function WorkoutBuilder({
  programId,
  initialSections,
}: {
  programId: string;
  initialSections: Section[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [addingSection, setAddingSection] = useState(false);
  const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
  const [sectionType, setSectionType] = useState("freestyle");
  const [sectionName, setSectionName] = useState("");
  const [sectionDuration, setSectionDuration] = useState("");
  const [setExerciseId, setSetExerciseId] = useState("");
  const [setCustomLabel, setSetCustomLabel] = useState("");
  const [setReps, setSetReps] = useState("");
  const [setRepRange, setSetRepRange] = useState("");
  const [setWeight, setSetWeight] = useState("");
  const [setSetType, setSetSetType] = useState("normal");
  const [error, setError] = useState("");

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  useEffect(() => {
    fetch("/api/admin/exercises")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setExercises(data))
      .catch(() => {});
  }, []);

  async function addSection() {
    setError("");
    const duration = sectionDuration ? parseInt(sectionDuration, 10) : undefined;
    const res = await fetch(`/api/admin/programs/${programId}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: sectionType,
        name: sectionName.trim() || null,
        durationSeconds: duration && !isNaN(duration) ? duration : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to add section.");
      return;
    }
    setAddingSection(false);
    setSectionName("");
    setSectionDuration("");
    router.refresh();
  }

  async function deleteSection(sectionId: string) {
    setError("");
    const res = await fetch(`/api/admin/programs/${programId}/sections/${sectionId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete section.");
      return;
    }
    router.refresh();
  }

  async function addSet(sectionId: string) {
    setError("");
    const res = await fetch(`/api/admin/programs/${programId}/sections/${sectionId}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: setExerciseId || null,
        customLabel: setCustomLabel.trim() || null,
        reps: setReps.trim() || null,
        repRange: setRepRange.trim() || null,
        weight: setWeight.trim() || null,
        setType: setSetType,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to add set.");
      return;
    }
    setAddingSetFor(null);
    setSetExerciseId("");
    setSetCustomLabel("");
    setSetReps("");
    setSetRepRange("");
    setSetWeight("");
    setSetSetType("normal");
    router.refresh();
  }

  async function deleteSet(sectionId: string, setId: string) {
    setError("");
    const res = await fetch(`/api/admin/programs/${programId}/sections/${sectionId}/sets/${setId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Failed to delete set.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Workout builder
        </h2>
        <Link
          href="/admin/exercises"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Exercise library
        </Link>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Add sections (e.g. warm-up, main work), then add sets with exercise, reps, weight, and set type.
      </p>
      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </p>
      )}

      {sections.map((sec) => (
        <div
          key={sec.id}
          className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
              {sec.name || `${sec.type} section`}
              {sec.durationSeconds != null && ` (${sec.durationSeconds}s)`}
            </h3>
            <button
              type="button"
              onClick={() => deleteSection(sec.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove section
            </button>
          </div>
          <ul className="mb-3 space-y-2">
            {sec.sets.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <span className="text-zinc-900 dark:text-zinc-100">
                  <strong>{s.exercise?.name ?? s.customLabel ?? "Set"}</strong>
                  {[s.reps, s.repRange, s.weight].filter(Boolean).length > 0 && (
                    <> — {[s.reps, s.repRange, s.weight].filter(Boolean).join(" ")}</>
                  )}
                  {s.setType !== "normal" && ` (${s.setType})`}
                </span>
                <button
                  type="button"
                  onClick={() => deleteSet(sec.id, s.id)}
                  className="text-zinc-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {addingSetFor === sec.id ? (
            <div className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-zinc-500">Exercise</label>
                  <select
                    value={setExerciseId}
                    onChange={(e) => setSetExerciseId(e.target.value)}
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">— or custom below —</option>
                    {exercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-zinc-500">Custom label (if no exercise)</label>
                  <input
                    type="text"
                    value={setCustomLabel}
                    onChange={(e) => setSetCustomLabel(e.target.value)}
                    placeholder="e.g. Plank"
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-zinc-500">Reps</label>
                  <input
                    type="text"
                    value={setReps}
                    onChange={(e) => setSetReps(e.target.value)}
                    placeholder="10 or AMRAP"
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-zinc-500">Rep range</label>
                  <input
                    type="text"
                    value={setRepRange}
                    onChange={(e) => setSetRepRange(e.target.value)}
                    placeholder="8-12"
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-zinc-500">Weight</label>
                  <input
                    type="text"
                    value={setWeight}
                    onChange={(e) => setSetWeight(e.target.value)}
                    placeholder="e.g. 50 lb"
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs font-medium text-zinc-500">Set type</label>
                  <select
                    value={setSetType}
                    onChange={(e) => setSetSetType(e.target.value)}
                    className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="normal">Normal</option>
                    <option value="warmup">Warm-up</option>
                    <option value="drop">Drop</option>
                    <option value="failure">Failure</option>
                  </select>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => addSet(sec.id)}
                  className="rounded bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
                >
                  Add set
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingSetFor(null);
                    setSetExerciseId("");
                    setSetCustomLabel("");
                    setSetReps("");
                    setSetRepRange("");
                    setSetWeight("");
                  }}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingSetFor(sec.id)}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              + Add set (reps, weight, exercise)
            </button>
          )}
        </div>
      ))}

      {addingSection ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h3 className="mb-3 font-medium text-zinc-900 dark:text-zinc-50">New section</h3>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="mb-0.5 block text-xs font-medium text-zinc-500">Type</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="freestyle">Freestyle</option>
                <option value="amrap">AMRAP</option>
                <option value="timed">Timed</option>
                <option value="interval">Interval</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-medium text-zinc-500">Name (optional)</label>
              <input
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g. Warm-up"
                className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-medium text-zinc-500">Duration (sec, optional)</label>
              <input
                type="number"
                min={1}
                value={sectionDuration}
                onChange={(e) => setSectionDuration(e.target.value)}
                placeholder="60"
                className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => addSection()}
              className="rounded bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)]"
            >
              Add section
            </button>
            <button
              type="button"
              onClick={() => setAddingSection(false)}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAddingSection(true)}
          className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
        >
          + Add section
        </button>
      )}
    </div>
  );
}
