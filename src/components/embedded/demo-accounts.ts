/**
 * The signed-in user each demo renders its form for.
 *
 * This is the second half of the pitch. The first half is that a SurveyJS form
 * can be dropped into somebody else's page and look native; this half is that the
 * same JSON definition arrives *already configured for whoever is looking at it* —
 * their name, their plan, their chart — and that the arrangement of the form
 * changes with them, not just the values in it.
 *
 * Mechanically it is one step: the object is published to survey-core as a single
 * variable named `user` (`model.setVariable("user", account)`), and the survey
 * JSON reaches into it by path:
 *
 *  - `"title": "Hi {user.firstName}, …"` pipes the value into text;
 *  - `"defaultValueExpression": "{user.email}"` pre-answers a question;
 *  - `"visibleIf": "{user.isNewPatient} = true"` adds or removes whole pages;
 *  - `"visibleIf": "{user.conditions} contains 'asthma'"` on a *choice* builds a
 *    list out of the account.
 *
 * One variable rather than one per key, because a path can never be mistaken for
 * a question: the clinic form has questions called `firstName` and `email` too.
 *
 * Nothing here is SurveyJS-specific data: it is the shape an app already has
 * after `getSession()` or a CRM lookup. One account per demo, and it is editable
 * live in the toolbar's JSON panel — which is the demonstration. Each account
 * below lists the edits worth making in front of an audience.
 */

/* ── reading an account the reviewer may have edited by hand ────────────────── */

export function accountText(
  account: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const value = account[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

/** Initials for the avatar, from whatever the account currently holds. */
export function accountInitials(account: Record<string, unknown>): string {
  const first = accountText(account, "firstName");
  const last = accountText(account, "lastName");
  const initials = `${first.charAt(0)}${last.charAt(0)}`.trim().toUpperCase();
  return initials || "?";
}

export function accountName(account: Record<string, unknown>): string {
  return [accountText(account, "firstName"), accountText(account, "lastName")]
    .filter(Boolean)
    .join(" ");
}

/**
 * Which account keys the definition on screen actually reads.
 *
 * Found by scanning the definition for a `{user.key}` reference rather than kept
 * in a hand-written list, so the editor panel can never claim a key is wired when
 * it is not — including after a reviewer has typed a new one into the JSON.
 */
export function usedVariableKeys(
  json: unknown,
  account: Record<string, unknown>,
): readonly string[] {
  const source = JSON.stringify(json ?? {});
  return Object.keys(account).filter((key) => source.includes(`{user.${key}}`));
}

/* ── the product's own user (feedback demo) ─────────────────────────────────── */

/**
 * A workspace admin, fourteen months in, with an open support ticket.
 *
 * Worth editing live: `"firstName"` changes the greeting; `"monthsActive": 1`
 * replaces the plan-fit question with a whole onboarding page; `"plan": "free"`
 * swaps it for the upgrade question; `"openTicket": false` drops the Support step
 * out of the progress bar; `"csmName": "Dana Whitfield"` brings the renewal
 * questions in; emptying `"email"` makes the form ask for one.
 */
export const CADENCE_ACCOUNT: Readonly<Record<string, unknown>> = {
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex.rivera@northwind.example",
  company: "Northwind Labs",
  role: "Workspace admin",
  plan: "business",
  planLabel: "Business",
  seats: 42,
  monthsActive: 14,
  openTicket: true,
  lastTicketSubject: "SSO group sync",
  csmName: "",
};

/* ── the CRM record behind a pricing page (cloud demo) ──────────────────────── */

/**
 * An existing US customer on the Team plan, sized from headcount.
 *
 * Worth editing live: `"region": "eu"` adds an entire data-residency page;
 * `"complianceOnFile": ["hipaa"]` adds the BAA question and a $600 line to the
 * quote; `"employees": 4000` re-sizes the project count and re-prices the page;
 * `"existingCustomer": false` swaps "what is this about" for "how far along are
 * you"; `"trialDaysLeft": 6` adds the trial notice.
 */
export const CUMULORA_ACCOUNT: Readonly<Record<string, unknown>> = {
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex.rivera@northwind.example",
  companyName: "Northwind Labs",
  industry: "Software",
  region: "us",
  regionLabel: "United States",
  employees: 320,
  seatsOnFile: 60,
  existingCustomer: true,
  currentPlanLabel: "Team",
  complianceOnFile: ["soc2"],
  trialDaysLeft: 0,
};

/* ── the patient portal record (clinic demo) ────────────────────────────────── */

/**
 * An established patient: identity and coverage on file, two conditions on the
 * chart, a refill due.
 *
 * Worth editing live: `"isNewPatient": true` empties the identity fields, unlocks
 * them and adds a page nobody else sees; `"healthPlanOnFile": "statecare"` turns
 * the $35 HMO copay into a $20 Medicare one and drops the referral warning;
 * emptying `"memberIdOnFile"` brings the insurance-card fields back; changing
 * `"conditions"` changes which diagnoses the follow-up question offers, and
 * `"medications"` which refills; `"homeLocation"` and `"primaryProvider"` move
 * the highlighted office and clinician further down the page.
 */
export const RIDGELINE_ACCOUNT: Readonly<Record<string, unknown>> = {
  firstName: "Maria",
  lastName: "Delgado",
  preferredName: "Maria",
  dateOfBirth: "1984-03-12",
  email: "maria.delgado@example.com",
  phone: "(503) 555-0148",
  mrn: "RFH-04812",
  isNewPatient: false,
  lastVisit: "18 April 2026",
  homeLocation: "westbridge",
  primaryProvider: "navarro",
  preferredLanguage: "es",
  languageLabel: "Spanish",
  needsInterpreter: true,
  healthPlanOnFile: "blueharbor",
  healthPlanLabel: "Blue Harbor HMO",
  memberIdOnFile: "BH-88213041",
  groupNumberOnFile: "NW-4471",
  conditions: ["asthma", "hypertension"],
  medications: ["albuterol", "lisinopril"],
  openRefills: true,
};
