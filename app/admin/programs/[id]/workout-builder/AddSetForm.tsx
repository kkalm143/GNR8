"use client";

import type { Exercise } from "../workout-builder-types";

type AddSetFormProps = {
  exercises: Exercise[];
  exerciseId: string;
  setExerciseId: (v: string) => void;
  customLabel: string;
  setCustomLabel: (v: string) => void;
  reps: string;
  setReps: (v: string) => void;
  repRange: string;
  setRepRange: (v: string) => void;
  weight: string;
  setWeight: (v: string) => void;
  setType: string;
  setSetType: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
};

export function AddSetForm({
  exercises,
  exerciseId,
  setExerciseId,
  customLabel,
  setCustomLabel,
  reps,
  setReps,
  repRange,
  setRepRange,
  weight,
  setWeight,
  setType,
  setSetType,
  onAdd,
  onCancel,
}: AddSetFormProps) {
  return (
    <div className="rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Exercise</label>
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
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
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. Plank"
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Reps</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="10 or AMRAP"
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Rep range</label>
          <input
            type="text"
            value={repRange}
            onChange={(e) => setRepRange(e.target.value)}
            placeholder="8-12"
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Weight</label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 50 lb"
            className="w-full rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Set type</label>
          <select
            value={setType}
            onChange={(e) => setSetType(e.target.value)}
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
        <button type="button" onClick={onAdd} className="rounded bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)]">Add set</button>
        <button type="button" onClick={onCancel} className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">Cancel</button>
      </div>
    </div>
  );
}
