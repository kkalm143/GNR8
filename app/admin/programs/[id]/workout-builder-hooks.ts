"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { Section, SectionTemplate, Exercise, Set } from "./workout-builder-types";

export function useWorkoutSections(programId: string, initialSections: Section[]) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [error, setError] = useState("");

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const addSection = useCallback(
    async (payload: { type: string; name: string | null; durationSeconds: number | null }) => {
      setError("");
      const res = await fetch(`/api/admin/programs/${programId}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to add section.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const deleteSection = useCallback(
    async (sectionId: string) => {
      setError("");
      const res = await fetch(`/api/admin/programs/${programId}/sections/${sectionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete section.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const addSet = useCallback(
    async (
      sectionId: string,
      payload: {
        exerciseId: string | null;
        customLabel: string | null;
        reps: string | null;
        repRange: string | null;
        weight: string | null;
        setType: string;
      }
    ) => {
      setError("");
      const res = await fetch(
        `/api/admin/programs/${programId}/sections/${sectionId}/sets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to add set.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const deleteSet = useCallback(
    async (sectionId: string, setId: string) => {
      setError("");
      const res = await fetch(
        `/api/admin/programs/${programId}/sections/${sectionId}/sets/${setId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setError("Failed to delete set.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const saveSectionEdit = useCallback(
    async (
      sectionId: string,
      payload: { type: string; name: string | null; durationSeconds: number | null }
    ) => {
      setError("");
      const res = await fetch(
        `/api/admin/programs/${programId}/sections/${sectionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update section.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const saveSetEdit = useCallback(
    async (
      sectionId: string,
      setId: string,
      payload: {
        exerciseId: string | null;
        customLabel: string | null;
        reps: string | null;
        repRange: string | null;
        weight: string | null;
        setType: string;
      }
    ) => {
      setError("");
      const res = await fetch(
        `/api/admin/programs/${programId}/sections/${sectionId}/sets/${setId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update set.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const moveSection = useCallback(
    async (fromIndex: number, direction: "up" | "down") => {
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= sections.length) return;
      setError("");
      const from = sections[fromIndex];
      const to = sections[toIndex];
      const fromOrder = from.displayOrder ?? fromIndex;
      const toOrder = to.displayOrder ?? toIndex;
      try {
        await fetch(`/api/admin/programs/${programId}/sections/${from.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: toOrder }),
        });
        await fetch(`/api/admin/programs/${programId}/sections/${to.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayOrder: fromOrder }),
        });
        router.refresh();
      } catch {
        setError("Failed to reorder.");
      }
    },
    [programId, router, sections]
  );

  const moveSet = useCallback(
    async (sectionId: string, fromIndex: number, direction: "up" | "down") => {
      const sec = sections.find((s) => s.id === sectionId);
      if (!sec || sec.sets.length === 0) return;
      const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= sec.sets.length) return;
      setError("");
      const fromSet = sec.sets[fromIndex];
      const toSet = sec.sets[toIndex];
      const fromOrder = fromSet.displayOrder ?? fromIndex;
      const toOrder = toSet.displayOrder ?? toIndex;
      try {
        await fetch(
          `/api/admin/programs/${programId}/sections/${sectionId}/sets/${fromSet.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayOrder: toOrder }),
          }
        );
        await fetch(
          `/api/admin/programs/${programId}/sections/${sectionId}/sets/${toSet.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayOrder: fromOrder }),
          }
        );
        router.refresh();
      } catch {
        setError("Failed to reorder set.");
      }
    },
    [programId, router, sections]
  );

  const duplicateSection = useCallback(
    async (sectionId: string) => {
      setError("");
      const res = await fetch(
        `/api/admin/programs/${programId}/sections/${sectionId}/clone`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to duplicate section.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  const saveSectionAsTemplate = useCallback(
    async (sectionId: string, name?: string) => {
      setError("");
      const res = await fetch("/api/admin/section-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save template.");
        return;
      }
      router.refresh();
    },
    [router]
  );

  const addSectionFromTemplate = useCallback(
    async (templateId: string) => {
      if (!templateId) return;
      setError("");
      const res = await fetch(
        `/api/admin/programs/${programId}/sections/from-template`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to add section from template.");
        return;
      }
      router.refresh();
    },
    [programId, router]
  );

  return {
    sections,
    error,
    setError,
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
  };
}

export function useExerciseAndTemplates() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([]);

  useEffect(() => {
    fetch("/api/admin/exercises")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setExercises(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/section-templates")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setSectionTemplates(data))
      .catch(() => {});
  }, []);

  return { exercises, sectionTemplates };
}

export function useSectionForm() {
  const [sectionType, setSectionType] = useState("freestyle");
  const [sectionName, setSectionName] = useState("");
  const [sectionDuration, setSectionDuration] = useState("");
  const [setExerciseId, setSetExerciseId] = useState("");
  const [setCustomLabel, setSetCustomLabel] = useState("");
  const [setReps, setSetReps] = useState("");
  const [setRepRange, setSetRepRange] = useState("");
  const [setWeight, setSetWeight] = useState("");
  const [setSetType, setSetSetType] = useState("normal");

  const resetAddSection = useCallback(() => {
    setSectionName("");
    setSectionDuration("");
  }, []);

  const resetAddSet = useCallback(() => {
    setSetExerciseId("");
    setSetCustomLabel("");
    setSetReps("");
    setSetRepRange("");
    setSetWeight("");
    setSetSetType("normal");
  }, []);

  return {
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
  };
}

export function useEditSectionForm() {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionName, setEditSectionName] = useState("");
  const [editSectionType, setEditSectionType] = useState("freestyle");
  const [editSectionDuration, setEditSectionDuration] = useState("");

  const startEdit = useCallback(
    (sec: Section) => {
      setEditSectionType(sec.type);
      setEditSectionName(sec.name ?? "");
      setEditSectionDuration(
        sec.durationSeconds != null ? String(sec.durationSeconds) : ""
      );
      setEditingSectionId(sec.id);
    },
    []
  );

  const cancelEdit = useCallback(() => setEditingSectionId(null), []);

  return {
    editingSectionId,
    editSectionName,
    setEditSectionName,
    editSectionType,
    setEditSectionType,
    editSectionDuration,
    setEditSectionDuration,
    startEdit,
    cancelEdit,
    setEditingSectionId,
  };
}

export function useEditSetForm() {
  const [editingSetId, setEditingSetId] = useState<{
    sectionId: string;
    setId: string;
  } | null>(null);
  const [editSetExerciseId, setEditSetExerciseId] = useState("");
  const [editSetCustomLabel, setEditSetCustomLabel] = useState("");
  const [editSetReps, setEditSetReps] = useState("");
  const [editSetRepRange, setEditSetRepRange] = useState("");
  const [editSetWeight, setEditSetWeight] = useState("");
  const [editSetSetType, setEditSetSetType] = useState("normal");

  const startEdit = useCallback((sec: Section, s: Set) => {
    setEditSetExerciseId(s.exercise?.id ?? "");
    setEditSetCustomLabel(s.customLabel ?? "");
    setEditSetReps(s.reps ?? "");
    setEditSetRepRange(s.repRange ?? "");
    setEditSetWeight(s.weight ?? "");
    setEditSetSetType(s.setType);
    setEditingSetId({ sectionId: sec.id, setId: s.id });
  }, []);

  const cancelEdit = useCallback(() => setEditingSetId(null), []);

  return {
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
    startEdit,
    cancelEdit,
    setEditingSetId,
  };
}
