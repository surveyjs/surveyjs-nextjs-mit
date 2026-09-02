/** The survey-JSON page, opened on one form — the link every demo points at. */
export function configureHref(formId: string): string {
  return `/configure?form=${encodeURIComponent(formId)}`;
}
