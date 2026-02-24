export type Exercise = { id: string; name: string };

export type Set = {
  id: string;
  displayOrder: number;
  reps: string | null;
  repRange: string | null;
  weight: string | null;
  setType: string;
  customLabel: string | null;
  exercise: { id: string; name: string } | null;
};

export type Section = {
  id: string;
  type: string;
  name: string | null;
  displayOrder: number;
  durationSeconds: number | null;
  sets: Set[];
};

export type SectionTemplate = { id: string; name: string; type: string };
