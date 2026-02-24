"use client";

type EditSectionFormProps = {
  editSectionType: string;
  setEditSectionType: (v: string) => void;
  editSectionName: string;
  setEditSectionName: (v: string) => void;
  editSectionDuration: string;
  setEditSectionDuration: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function EditSectionForm({
  editSectionType,
  setEditSectionType,
  editSectionName,
  setEditSectionName,
  editSectionDuration,
  setEditSectionDuration,
  onSave,
  onCancel,
}: EditSectionFormProps) {
  return (
    <div className="mb-3 rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Type</label>
          <select
            value={editSectionType}
            onChange={(e) => setEditSectionType(e.target.value)}
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
            value={editSectionName}
            onChange={(e) => setEditSectionName(e.target.value)}
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-xs font-medium text-zinc-500">Duration (sec)</label>
          <input
            type="number"
            min={1}
            value={editSectionDuration}
            onChange={(e) => setEditSectionDuration(e.target.value)}
            className="w-20 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onSave} className="rounded bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--brand-hover)]">Save</button>
        <button type="button" onClick={onCancel} className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-600 dark:text-zinc-300">Cancel</button>
      </div>
    </div>
  );
}
