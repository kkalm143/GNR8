"use client";

import type { Section, Set as SetType } from "../workout-builder-types";
import type { Exercise } from "../workout-builder-types";
import { SetRow } from "./SetRow";
import { AddSetForm } from "./AddSetForm";
import { EditSectionForm } from "./EditSectionForm";
import { EditSetForm } from "./EditSetForm";

type SectionCardProps = {
  section: Section;
  sectionIndex: number;
  sectionsCount: number;
  exercises: Exercise[];
  addingSetFor: string | null;
  setAddingSetFor: (id: string | null) => void;
  editingSectionId: string | null;
  editSectionName: string;
  setEditSectionName: (v: string) => void;
  editSectionType: string;
  setEditSectionType: (v: string) => void;
  editSectionDuration: string;
  setEditSectionDuration: (v: string) => void;
  saveTemplateSectionId: string | null;
  saveTemplateName: string;
  setSaveTemplateName: (v: string) => void;
  onStartEditSection: (sec: Section) => void;
  onSaveSectionEdit: (sectionId: string, payload: { type: string; name: string | null; durationSeconds: number | null }) => void;
  onCancelEditSection: () => void;
  onDuplicateSection: (sectionId: string) => void;
  onSaveSectionAsTemplate: (sectionId: string, name?: string) => void;
  onCancelSaveTemplate: () => void;
  onSetSaveTemplateSectionId: (id: string | null) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (index: number, dir: "up" | "down") => void;
  editingSetId: { sectionId: string; setId: string } | null;
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
  onStartEditSet: (sec: Section, s: SetType) => void;
  onSaveSetEdit: (sectionId: string, setId: string, payload: { exerciseId: string | null; customLabel: string | null; reps: string | null; repRange: string | null; weight: string | null; setType: string }) => void;
  onCancelEditSet: () => void;
  setExerciseId: string;
  setSetExerciseId: (v: string) => void;
  setCustomLabel: string;
  setSetCustomLabel: (v: string) => void;
  setReps: string;
  setSetReps: (v: string) => void;
  setRepRange: string;
  setSetRepRange: (v: string) => void;
  setWeight: string;
  setSetWeight: (v: string) => void;
  setSetType: string;
  setSetSetType: (v: string) => void;
  onAddSet: (sectionId: string, payload: { exerciseId: string | null; customLabel: string | null; reps: string | null; repRange: string | null; weight: string | null; setType: string }) => void;
  onResetAddSet: () => void;
  onDeleteSet: (sectionId: string, setId: string) => void;
  onMoveSet: (sectionId: string, setIndex: number, dir: "up" | "down") => void;
};

export function SectionCard({
  section: sec,
  sectionIndex: secIndex,
  sectionsCount,
  exercises,
  addingSetFor,
  setAddingSetFor,
  editingSectionId,
  editSectionName,
  setEditSectionName,
  editSectionType,
  setEditSectionType,
  editSectionDuration,
  setEditSectionDuration,
  saveTemplateSectionId,
  saveTemplateName,
  setSaveTemplateName,
  onStartEditSection,
  onSaveSectionEdit,
  onCancelEditSection,
  onDuplicateSection,
  onSaveSectionAsTemplate,
  onCancelSaveTemplate,
  onSetSaveTemplateSectionId,
  onDeleteSection,
  onMoveSection,
  editingSetId,
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
  onStartEditSet,
  onSaveSetEdit,
  onCancelEditSet,
  setExerciseId,
  setSetExerciseId,
  setCustomLabel,
  setSetCustomLabel,
  setReps,
  setSetReps,
  setRepRange,
  setSetRepRange,
  setWeight,
  setSetWeight,
  setSetType,
  setSetSetType,
  onAddSet,
  onResetAddSet,
  onDeleteSet,
  onMoveSet,
}: SectionCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      {editingSectionId === sec.id ? (
        <EditSectionForm
          editSectionType={editSectionType}
          setEditSectionType={setEditSectionType}
          editSectionName={editSectionName}
          setEditSectionName={setEditSectionName}
          editSectionDuration={editSectionDuration}
          setEditSectionDuration={setEditSectionDuration}
          onSave={() => {
            const duration = editSectionDuration ? parseInt(editSectionDuration, 10) : undefined;
            onSaveSectionEdit(sec.id, {
              type: editSectionType,
              name: editSectionName.trim() || null,
              durationSeconds: duration && !isNaN(duration) ? duration : null,
            });
          }}
          onCancel={onCancelEditSection}
        />
      ) : (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
            {sec.name || `${sec.type} section`}
            {sec.durationSeconds != null && ` (${sec.durationSeconds}s)`}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onMoveSection(secIndex, "up")} disabled={secIndex === 0} className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:hover:text-zinc-50">↑</button>
            <button type="button" onClick={() => onMoveSection(secIndex, "down")} disabled={secIndex === sectionsCount - 1} className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:hover:text-zinc-50">↓</button>
            <button type="button" onClick={() => onStartEditSection(sec)} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Edit</button>
            <button type="button" onClick={() => onDuplicateSection(sec.id)} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Duplicate section</button>
            {saveTemplateSectionId === sec.id ? (
              <span className="flex items-center gap-2">
                <input
                  type="text"
                  value={saveTemplateName}
                  onChange={(e) => setSaveTemplateName(e.target.value)}
                  placeholder="Template name"
                  className="w-36 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <button type="button" onClick={() => onSaveSectionAsTemplate(sec.id, saveTemplateName.trim() || undefined)} className="text-sm font-medium text-[var(--brand)]">Save</button>
                <button type="button" onClick={onCancelSaveTemplate} className="text-sm text-zinc-500">Cancel</button>
              </span>
            ) : (
              <button type="button" onClick={() => onSetSaveTemplateSectionId(sec.id)} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Save as template</button>
            )}
            <button type="button" onClick={() => onDeleteSection(sec.id)} className="text-sm text-red-600 hover:underline">Remove section</button>
          </div>
        </div>
      )}
      <ul className="mb-3 space-y-2">
        {sec.sets.map((s, setIndex) => (
          <SetRow
            key={s.id}
            set={s}
            section={sec}
            setIndex={setIndex}
            exercises={exercises}
            isEditing={editingSetId?.sectionId === sec.id && editingSetId?.setId === s.id}
            editSetExerciseId={editSetExerciseId}
            setEditSetExerciseId={setEditSetExerciseId}
            editSetCustomLabel={editSetCustomLabel}
            setEditSetCustomLabel={setEditSetCustomLabel}
            editSetReps={editSetReps}
            setEditSetReps={setEditSetReps}
            editSetRepRange={editSetRepRange}
            setEditSetRepRange={setEditSetRepRange}
            editSetWeight={editSetWeight}
            setEditSetWeight={setEditSetWeight}
            editSetSetType={editSetSetType}
            setEditSetSetType={setEditSetSetType}
            onSaveEdit={() =>
              onSaveSetEdit(sec.id, s.id, {
                exerciseId: editSetExerciseId || null,
                customLabel: editSetCustomLabel.trim() || null,
                reps: editSetReps.trim() || null,
                repRange: editSetRepRange.trim() || null,
                weight: editSetWeight.trim() || null,
                setType: editSetSetType,
              })
            }
            onCancelEdit={onCancelEditSet}
            onStartEdit={() => onStartEditSet(sec, s)}
            onDelete={() => onDeleteSet(sec.id, s.id)}
            onMoveUp={() => onMoveSet(sec.id, setIndex, "up")}
            onMoveDown={() => onMoveSet(sec.id, setIndex, "down")}
            canMoveUp={setIndex > 0}
            canMoveDown={setIndex < sec.sets.length - 1}
          />
        ))}
      </ul>
      {addingSetFor === sec.id ? (
        <AddSetForm
          exercises={exercises}
          exerciseId={setExerciseId}
          setExerciseId={setSetExerciseId}
          customLabel={setCustomLabel}
          setCustomLabel={setSetCustomLabel}
          reps={setReps}
          setReps={setSetReps}
          repRange={setRepRange}
          setRepRange={setSetRepRange}
          weight={setWeight}
          setWeight={setSetWeight}
          setType={setSetType}
          setSetType={setSetSetType}
          onAdd={() =>
            onAddSet(sec.id, {
              exerciseId: setExerciseId || null,
              customLabel: setCustomLabel.trim() || null,
              reps: setReps.trim() || null,
              repRange: setRepRange.trim() || null,
              weight: setWeight.trim() || null,
              setType: setSetType,
            })
          }
          onCancel={() => {
            setAddingSetFor(null);
            onResetAddSet();
          }}
        />
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
  );
}
