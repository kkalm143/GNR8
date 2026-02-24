"use client";

import type { Section, Set as SetType } from "../workout-builder-types";
import type { Exercise } from "../workout-builder-types";
import { EditSetForm } from "./EditSetForm";

type SetRowProps = {
  set: SetType;
  section: Section;
  setIndex: number;
  exercises: Exercise[];
  isEditing: boolean;
  editSetExerciseId: string;
  setEditSetExerciseId: (v: string) => void;
  editSetCustomLabel: string;
  setEditSetCustomLabel: (v: string) => void;
  editSetReps: string;
  setEditSetReps: (v: string) => void;
  editSetRepRange: string;
  setEditSetRepRange: (v: string) => void;
  editSetWeight: string;
  setEditSetWeight: (v: string) => void;
  editSetSetType: string;
  setEditSetSetType: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function SetRow({
  set: s,
  exercises,
  isEditing,
  editSetExerciseId,
  setEditSetExerciseId,
  editSetCustomLabel,
  setEditSetCustomLabel,
  editSetReps,
  setEditSetReps,
  editSetRepRange,
  setEditSetRepRange,
  editSetWeight,
  setEditSetWeight,
  editSetSetType,
  setEditSetSetType,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SetRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
      {isEditing ? (
        <EditSetForm
          exercises={exercises}
          exerciseId={editSetExerciseId}
          setExerciseId={setEditSetExerciseId}
          customLabel={editSetCustomLabel}
          setCustomLabel={setEditSetCustomLabel}
          reps={editSetReps}
          setReps={setEditSetReps}
          repRange={editSetRepRange}
          setRepRange={setEditSetRepRange}
          weight={editSetWeight}
          setWeight={setEditSetWeight}
          setType={editSetSetType}
          setSetType={setEditSetSetType}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
        />
      ) : (
        <>
          <span className="text-zinc-900 dark:text-zinc-100">
            <strong>{s.exercise?.name ?? s.customLabel ?? "Set"}</strong>
            {[s.reps, s.repRange, s.weight].filter(Boolean).length > 0 && (
              <> — {[s.reps, s.repRange, s.weight].filter(Boolean).join(" ")}</>
            )}
            {s.setType !== "normal" && ` (${s.setType})`}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onMoveUp} disabled={!canMoveUp} className="text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:hover:text-zinc-50">↑</button>
            <button type="button" onClick={onMoveDown} disabled={!canMoveDown} className="text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:hover:text-zinc-50">↓</button>
            <button type="button" onClick={onStartEdit} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Edit</button>
            <button type="button" onClick={onDelete} className="text-zinc-500 hover:text-red-600">Remove</button>
          </div>
        </>
      )}
    </li>
  );
}
