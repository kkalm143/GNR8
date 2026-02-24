/**
 * Route → section accent mapping for UI/UX refresh.
 * Used for nav active state, card accents, and page headers.
 */
export type SectionToken = "--section-primary" | "--section-cool" | "--section-warm";

const ROUTE_TO_SECTION: Record<string, SectionToken> = {
  "/today": "--section-primary",
  "/programs": "--section-cool",
  "/progress": "--section-cool",
  "/tasks": "--section-warm",
  "/inbox": "--section-warm",
  "/coaching": "--section-primary",
  "/account": "--section-warm",
  "/results": "--section-cool",
};

export function getSectionToken(pathname: string | null): SectionToken {
  if (!pathname) return "--section-primary";
  const base = pathname.split("/").slice(0, 2).join("/") || "/";
  return ROUTE_TO_SECTION[base] ?? "--section-primary";
}
