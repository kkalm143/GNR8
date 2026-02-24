"use client";

import type { SectionTemplate } from "../workout-builder-types";

type TemplateActionsProps = {
  sectionTemplates: SectionTemplate[];
  fromTemplateId: string;
  setFromTemplateId: (v: string) => void;
  onAddFromTemplate: (templateId: string) => void;
  onAddSection: () => void;
};

export function TemplateActions({
  sectionTemplates,
  fromTemplateId,
  setFromTemplateId,
  onAddFromTemplate,
  onAddSection,
}: TemplateActionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAddSection}
          className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
        >
          + Add section
        </button>
        {sectionTemplates.length > 0 && (
          <>
            <select
              value={fromTemplateId}
              onChange={(e) => setFromTemplateId(e.target.value)}
              className="rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">From template…</option>
              {sectionTemplates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onAddFromTemplate(fromTemplateId)}
              disabled={!fromTemplateId}
              className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              Add from template
            </button>
          </>
        )}
      </div>
    </div>
  );
}
