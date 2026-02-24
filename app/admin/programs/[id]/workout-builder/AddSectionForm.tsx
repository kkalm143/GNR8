"use client";

type AddSectionFormProps = {
  sectionType: string;
  setSectionType: (v: string) => void;
  sectionName: string;
  setSectionName: (v: string) => void;
  sectionDuration: string;
  setSectionDuration: (v: string) => void;
  onAdd: () => void;
  onCancel: () => void;
};

export function AddSectionForm({
  sectionType,
  setSectionType,
  sectionName,
  setSectionName,
  sectionDuration,
  setSectionDuration,
  onAdd,
  onCancel,
}: AddSectionFormProps) {
  return (
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
        <button type="button" onClick={onAdd} className="rounded bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)]">Add section</button>
        <button type="button" onClick={onCancel} className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">Cancel</button>
      </div>
    </div>
  );
}
