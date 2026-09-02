/** The admin, opened on one form — the link both the demos and the shell use. */
export function adminHref(formId: string): string {
  return `/admin?form=${encodeURIComponent(formId)}`;
}
