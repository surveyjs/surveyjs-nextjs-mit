import type { SurveyData } from "@/schemas";

/**
 * The people a personalized form is rendered for, as the admin keeps them.
 *
 * The third seam between this template and your storage, next to
 * `survey-json.ts` (definitions) and `survey-results.ts` (answers). In a real
 * application this list does not exist: the "user" is whatever `getSession()`
 * and your CRM already return, and there is exactly one of them — the person
 * looking at the page.
 *
 * It exists here because a demo has no session. Somebody presenting the library
 * needs to be able to say "and this is the same form for a different patient",
 * so the admin keeps a handful of records, each one a set of answers to the
 * account editor in `demo-accounts.ts`, and the embedded demos let the visitor
 * switch between them.
 *
 * Same shape as its siblings: async signatures over localStorage, so swapping in
 * `fetch("/api/users")` changes nothing at the call sites. Per browser, so one
 * visitor's Maria never becomes anyone else's.
 */

const PREFIX = "sjs-demo-users:";

/** One saved account: an id to key it by, and the editor's answers. */
export interface DemoUserRecord {
  readonly id: string;
  readonly data: SurveyData;
}

function key(formId: string): string {
  return `${PREFIX}${formId}`;
}

function isRecord(value: unknown): value is DemoUserRecord {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.data === "object" &&
    candidate.data !== null &&
    !Array.isArray(candidate.data)
  );
}

/** The saved list for `formId`, or null when the visitor has none. */
export async function loadDemoUsers(
  formId: string,
): Promise<readonly DemoUserRecord[] | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(formId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const users = parsed.filter(isRecord);
    // An empty list would leave a demo with nobody signed in, which reads as a
    // bug rather than as a choice.
    return users.length > 0 ? users : null;
  } catch {
    return null;
  }
}

/** Store the list. Throws when storage refuses it, so the admin can report it. */
export async function saveDemoUsers(
  formId: string,
  users: readonly DemoUserRecord[],
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Users can only be saved in the browser.");
  }
  try {
    window.localStorage.setItem(key(formId), JSON.stringify(users));
  } catch {
    throw new Error(
      "Could not write to localStorage — private browsing or storage is full.",
    );
  }
}

/** Drop the list, so the account that ships with the template applies again. */
export async function resetDemoUsers(formId: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(formId));
  } catch {
    // Ignore — a demo override is not worth surfacing a storage failure for.
  }
}
