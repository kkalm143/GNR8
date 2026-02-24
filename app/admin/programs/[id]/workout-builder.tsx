"use client";

import { useState } from "react";
import Link from "next/link";
import type { Section, Set as SetType } from "./workout-builder-types";
import {
  useWorkoutSections,
  useExerciseAndTemplates,
  useSectionForm,
  useEditSectionForm,
  useEditSetForm,
} from "./workout-builder-hooks";
import { SectionCard } from "./workout-builder/SectionCard";
import { AddSectionForm } from "./workout-builder/AddSectionForm";
import { TemplateActions } from "./workout-builder/TemplateActions";

export function WorkoutBuilder({
  programId,
  initialSections,
}: {
  programId: string;
  initialSections: Section[];
}) {
  const [addingSection, setAddingSection] = useState(false);
  const [addingSetFor, setAddingSetFor] = useState<string | null>(null);
  const [saveTemplateSectionId, setSaveTemplateSectionId] = useState<string | null>(null);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [fromTemplateId, setFromTemplateId] = useState("");

  const {
    sections,
    error,
    addSection,
    deleteSection,
    addSet,
    deleteSet,
    saveSectionEdit,
    saveSetEdit,
    moveSection,
    moveSet,
    duplicateSection,
    saveSectionAsTemplate,
    addSectionFromTemplate,
  } = useWorkoutSections(programId, initialSections);

  const { exercises, sectionTemplates } = useExerciseAndTemplates();

  const {
    sectionType,
    setSectionType,
    sectionName,
    setSectionName,
    sectionDuration,
    setSectionDuration,
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
    resetAddSection,
    resetAddSet,
  } = useSectionForm();

  const {
    editingSectionId,
    editSectionName,
    setEditSectionName,
    editSectionType,
    setEditSectionType,
    editSectionDuration,
    setEditSectionDuration,
    startEdit: startEditSection,
    cancelEdit: cancelEditSection,
    setEditingSectionId,
  } = useEditSectionForm();

  const {
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
    startEdit: startEditSet,
    cancelEdit: cancelEditSet,
    setEditingSetId,
  } = useEditSetForm();

  const handleAddSection = () => {
    const duration = sectionDuration ? parseInt(sectionDuration, 10) : undefined;
    addSection({
      type: sectionType,
      name: sectionName.trim() || null,
      durationSeconds: duration && !isNaN(duration) ? duration : null,
    });
    setAddingSection(false);
    resetAddSection();
  };

  const handleAddSet = (sectionId: string, payload: Parameters<typeof addSet>[1]) => {
    addSet(sectionId, payload);
    setAddingSetFor(null);
    resetAddSet();
  };

  const handleSaveSectionAsTemplate = (sectionId: string, name?: string) => {
    saveSectionAsTemplate(sectionId, name);
    setSaveTemplateSectionId(null);
    setSaveTemplateName("");
  };

  const handleStartEditSection = (sec: Section) => {
    startEditSection(sec);
    setEditingSetId(null);
  };

  const handleStartEditSet = (sec: Section, s: SetType) => {
    startEditSet(sec, s);
    setEditingSectionId(null);
  };

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

      {sections.map((sec, secIndex) => (
        <SectionCard
          key={sec.id}
          section={sec}
          sectionIndex={secIndex}
          sectionsCount={sections.length}
          exercises={exercises}
          addingSetFor={addingSetFor}
          setAddingSetFor={setAddingSetFor}
          editingSectionId={editingSectionId}
          editSectionName={editSectionName}
          setEditSectionName={setEditSectionName}
          editSectionType={editSectionType}
          setEditSectionType={setEditSectionType}
          editSectionDuration={editSectionDuration}
          setEditSectionDuration={setEditSectionDuration}
          saveTemplateSectionId={saveTemplateSectionId}
          saveTemplateName={saveTemplateName}
          setSaveTemplateName={setSaveTemplateName}
          onStartEditSection={handleStartEditSection}
          onSaveSectionEdit={saveSectionEdit}
          onCancelEditSection={cancelEditSection}
          onDuplicateSection={duplicateSection}
          onSaveSectionAsTemplate={handleSaveSectionAsTemplate}
          onCancelSaveTemplate={() => {
            setSaveTemplateSectionId(null);
            setSaveTemplateName("");
          }}
          onSetSaveTemplateSectionId={setSaveTemplateSectionId}
          onDeleteSection={deleteSection}
          onMoveSection={moveSection}
          editingSetId={editingSetId}
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
          onStartEditSet={handleStartEditSet}
          onSaveSetEdit={saveSetEdit}
          onCancelEditSet={cancelEditSet}
          setExerciseId={setExerciseId}
          setSetExerciseId={setSetExerciseId}
          setCustomLabel={setCustomLabel}
          setSetCustomLabel={setSetCustomLabel}
          setReps={setReps}
          setSetReps={setSetReps}
          setRepRange={setRepRange}
          setSetRepRange={setSetRepRange}
          setWeight={setWeight}
          setSetWeight={setSetWeight}
          setSetType={setSetType}
          setSetSetType={setSetSetType}
          onAddSet={handleAddSet}
          onResetAddSet={resetAddSet}
          onDeleteSet={deleteSet}
          onMoveSet={moveSet}
        />
      ))}

      {addingSection ? (
        <AddSectionForm
          sectionType={sectionType}
          setSectionType={setSectionType}
          sectionName={sectionName}
          setSectionName={setSectionName}
          sectionDuration={sectionDuration}
          setSectionDuration={setSectionDuration}
          onAdd={handleAddSection}
          onCancel={() => setAddingSection(false)}
        />
      ) : (
        <TemplateActions
          sectionTemplates={sectionTemplates}
          fromTemplateId={fromTemplateId}
          setFromTemplateId={setFromTemplateId}
          onAddFromTemplate={(templateId) => {
            addSectionFromTemplate(templateId);
            setFromTemplateId("");
          }}
          onAddSection={() => setAddingSection(true)}
        />
      )}
    </div>
  );
}
