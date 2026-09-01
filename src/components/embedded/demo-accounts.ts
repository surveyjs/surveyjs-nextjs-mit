import {
  CHART_CONDITIONS,
  CHART_MEDICATIONS,
  CLINIC_LOCATIONS,
  COMPLIANCE_ADDONS,
  HEALTH_PLANS,
  PROVIDERS,
  type SurveyData,
  type SurveyJSON,
} from "@/schemas";

/**
 * The signed-in user each demo renders its form for — and the form used to edit
 * them, which is itself a SurveyJS survey.
 *
 * This is the second half of the pitch. The first half is that a SurveyJS form
 * can be dropped into somebody else's page and look native; this half is that the
 * same JSON definition arrives *already configured for whoever is looking at it* —
 * their name, their plan, their chart — and that the arrangement of the form
 * changes with them, not just the values in it.
 *
 * Mechanically it is one step: the account object is published to survey-core as
 * a single variable named `user` (`model.setVariable("user", account)`), and the
 * survey JSON reaches into it by path:
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
 * after `getSession()` or a CRM lookup. What is deliberate is where it comes from
 * in the demo — `json` below is a **survey**, so the toolbar's "Edit the user"
 * popup is the library editing the library's own input, with no bespoke form code
 * anywhere. Answers in, context object out; `toAccount` is the only translation,
 * and it exists to fill the display labels a dropdown's `value` cannot carry.
 */
export interface DemoUser {
  /** The editor form, rendered in the toolbar's popup. */
  readonly json: SurveyJSON;
  /** What the host app knows about the visitor when the page opens. */
  readonly defaults: SurveyData;
  /** Answers → the object handed to the survey as `user`. */
  readonly toAccount: (data: SurveyData) => Record<string, unknown>;
}

interface Choice {
  readonly value: string;
  readonly text: string;
}

/** The text behind a dropdown's value — what piping needs and `value` is not. */
function labelOf(choices: readonly Choice[], value: unknown): string {
  return choices.find((choice) => choice.value === value)?.text ?? "";
}

/** Shared shape: a live editor, so no navigation and no completion. */
const EDITOR_BASE = {
  showQuestionNumbers: "off",
  widthMode: "responsive",
  questionErrorLocation: "bottom",
  showNavigationButtons: "none",
} as const;

/* ── reading an account the reviewer may have edited ────────────────────────── */

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
 * in a hand-written list, so the panel can never claim a key is wired when it is
 * not — including after a reviewer has typed a new one into the JSON.
 */
export function usedVariableKeys(
  json: unknown,
  account: Record<string, unknown>,
): readonly string[] {
  const source = JSON.stringify(json ?? {});
  return Object.keys(account).filter((key) => source.includes(`{user.${key}}`));
}

/* ── the product's own user (feedback demo) ─────────────────────────────────── */

const CADENCE_PLANS: readonly Choice[] = [
  { value: "free", text: "Free" },
  { value: "business", text: "Business" },
  { value: "enterprise", text: "Enterprise" },
];

/**
 * A workspace admin, fourteen months in, with an open support ticket.
 *
 * Worth changing in front of an audience: the name (the greeting follows),
 * *months as a customer* down to 1 (the plan-fit question is replaced by a whole
 * onboarding page), the plan to Free (the upgrade question instead), the ticket
 * switch (the Support step leaves the progress bar), the CSM name (renewal
 * questions arrive), or clearing the email (the form starts asking for one).
 */
export const CADENCE_USER: DemoUser = {
  json: {
    ...EDITOR_BASE,
    pages: [
      {
        name: "account",
        elements: [
          {
            type: "html",
            name: "note",
            html: "<p>This is the record the host app already has. The survey on the page behind reads it as <code>{user.…}</code>.</p>",
          },
          { type: "text", name: "firstName", title: "First name" },
          { type: "text", name: "lastName", title: "Last name", startWithNewLine: false },
          { type: "text", name: "email", title: "Email", inputType: "email" },
          { type: "text", name: "company", title: "Company" },
          { type: "text", name: "role", title: "Role", startWithNewLine: false },
          {
            type: "dropdown",
            name: "plan",
            title: "Plan",
            choices: [...CADENCE_PLANS],
          },
          {
            type: "text",
            name: "seats",
            title: "Seats",
            inputType: "number",
            min: 1,
            startWithNewLine: false,
          },
          {
            type: "text",
            name: "monthsActive",
            title: "Months as a customer",
            description: "Under 3 turns the survey into an onboarding one.",
            inputType: "number",
            min: 0,
          },
          {
            type: "text",
            name: "csmName",
            title: "Named CSM",
            description: "Blank for accounts that do not have one.",
            startWithNewLine: false,
          },
          {
            type: "boolean",
            name: "openTicket",
            title: "Open support ticket?",
            labelTrue: "Yes, one is open",
            labelFalse: "No",
          },
          {
            type: "text",
            name: "lastTicketSubject",
            title: "What it is about",
            visibleIf: "{openTicket} = true",
          },
        ],
      },
    ],
  },
  defaults: {
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@northwind.example",
    company: "Northwind Labs",
    role: "Workspace admin",
    plan: "business",
    seats: 42,
    monthsActive: 14,
    openTicket: true,
    lastTicketSubject: "SSO group sync",
    csmName: "",
  },
  toAccount: (data) => ({
    ...data,
    planLabel: labelOf(CADENCE_PLANS, data.plan),
  }),
};

/* ── the CRM record behind a pricing page (cloud demo) ──────────────────────── */

const CUMULORA_REGIONS: readonly Choice[] = [
  { value: "us", text: "United States" },
  { value: "eu", text: "European Union" },
];

/**
 * An existing US customer on the Team plan, sized from headcount.
 *
 * Worth changing in front of an audience: the region to the EU (an entire
 * data-residency page appears), HIPAA on the compliance list (the BAA question
 * arrives and $600 lands on the quote), the headcount (the project count and the
 * price move), or the customer switch (a prospect is asked how far along they are
 * instead of what they are changing).
 */
export const CUMULORA_USER: DemoUser = {
  json: {
    ...EDITOR_BASE,
    pages: [
      {
        name: "account",
        elements: [
          {
            type: "html",
            name: "note",
            html: "<p>The CRM record behind the pricing page. The configurator reads it as <code>{user.…}</code>.</p>",
          },
          { type: "text", name: "companyName", title: "Company" },
          { type: "text", name: "industry", title: "Industry", startWithNewLine: false },
          { type: "text", name: "firstName", title: "Contact first name" },
          { type: "text", name: "lastName", title: "Last name", startWithNewLine: false },
          { type: "text", name: "email", title: "Email", inputType: "email" },
          {
            type: "dropdown",
            name: "region",
            title: "Region",
            description: "The EU adds a data-residency step.",
            choices: [...CUMULORA_REGIONS],
          },
          {
            type: "text",
            name: "employees",
            title: "Employees",
            description: "The project count is sized from this.",
            inputType: "number",
            min: 1,
            startWithNewLine: false,
          },
          { type: "text", name: "seatsOnFile", title: "Seats on file", inputType: "number", min: 0 },
          {
            type: "text",
            name: "trialDaysLeft",
            title: "Trial days left",
            description: "0 for accounts not on trial.",
            inputType: "number",
            min: 0,
            startWithNewLine: false,
          },
          {
            type: "checkbox",
            name: "complianceOnFile",
            title: "Compliance on the account",
            choices: COMPLIANCE_ADDONS.map((addon) => ({ value: addon.id, text: addon.name })),
          },
          {
            type: "boolean",
            name: "existingCustomer",
            title: "Already a customer?",
            labelTrue: "Yes",
            labelFalse: "No, a prospect",
          },
          {
            type: "text",
            name: "currentPlanLabel",
            title: "Plan they are on today",
            visibleIf: "{existingCustomer} = true",
          },
        ],
      },
    ],
  },
  defaults: {
    firstName: "Alex",
    lastName: "Rivera",
    email: "alex.rivera@northwind.example",
    companyName: "Northwind Labs",
    industry: "Software",
    region: "us",
    employees: 320,
    seatsOnFile: 60,
    existingCustomer: true,
    currentPlanLabel: "Team",
    complianceOnFile: ["soc2"],
    trialDaysLeft: 0,
  },
  toAccount: (data) => ({
    ...data,
    regionLabel: labelOf(CUMULORA_REGIONS, data.region),
  }),
};

/* ── the patient portal record (clinic demo) ────────────────────────────────── */

const CLINIC_LANGUAGES: readonly Choice[] = [
  { value: "en", text: "English" },
  { value: "es", text: "Spanish" },
  { value: "vi", text: "Vietnamese" },
  { value: "ru", text: "Russian" },
  { value: "zh", text: "Mandarin" },
];

/**
 * An established patient: identity and coverage on file, two conditions on the
 * chart, a refill due.
 *
 * The one switch worth throwing in front of an audience is the first: a
 * first-time patient has no chart, so the editor's whole "on file" panel goes
 * away — and because the editor sets `clearInvisibleValues: "onHiddenContainer"`,
 * the values go with it. The account empties, and the appointment form on the page
 * behind turns from four confirmations into the long version, insurance-card
 * fields and all.
 *
 * Smaller ones: the plan (a $35 HMO copay becomes a $20 Medicare one and the
 * referral warning goes), the conditions (which diagnoses the follow-up question
 * offers), the medications (which refills), the office and the clinician (which
 * cards light up further down the page).
 */
export const RIDGELINE_USER: DemoUser = {
  json: {
    ...EDITOR_BASE,
    // Hiding the panel drops its answers, so "first visit" really does empty the
    // chart instead of leaving a plan on a patient we have never seen.
    clearInvisibleValues: "onHiddenContainer",
    pages: [
      {
        name: "chart",
        elements: [
          {
            type: "html",
            name: "note",
            html: "<p>The patient portal record. The appointment form on the page behind reads it as <code>{user.…}</code>.</p>",
          },
          {
            type: "boolean",
            name: "isNewPatient",
            title: "First visit to Ridgeline?",
            description: "Turn this on and the chart below goes away with it.",
            labelTrue: "Yes, nobody on file",
            labelFalse: "No, an established patient",
          },
          {
            type: "panel",
            name: "onFile",
            title: "What we have on file",
            visibleIf: "{isNewPatient} = false",
            elements: [
              { type: "text", name: "firstName", title: "Legal first name" },
              { type: "text", name: "lastName", title: "Last name", startWithNewLine: false },
              { type: "text", name: "preferredName", title: "Preferred name" },
              {
                type: "text",
                name: "dateOfBirth",
                title: "Date of birth",
                inputType: "date",
                startWithNewLine: false,
              },
              {
                type: "text",
                name: "phone",
                title: "Mobile phone",
                inputType: "tel",
                maskType: "pattern",
                // Without this survey-core stores the digits alone, and the object
                // shown under the editor would not match what was typed.
                maskSettings: { pattern: "(999) 999-9999", saveMaskedValue: true },
              },
              {
                type: "text",
                name: "email",
                title: "Email",
                inputType: "email",
                startWithNewLine: false,
              },
              { type: "text", name: "mrn", title: "Medical record number" },
              { type: "text", name: "lastVisit", title: "Last seen", startWithNewLine: false },
              {
                type: "dropdown",
                name: "homeLocation",
                title: "Usual office",
                choices: CLINIC_LOCATIONS.map((location) => ({
                  value: location.id,
                  text: location.name,
                })),
              },
              {
                type: "dropdown",
                name: "primaryProvider",
                title: "Primary clinician",
                startWithNewLine: false,
                choices: PROVIDERS.map((provider) => ({
                  value: provider.id,
                  text: `${provider.name}, ${provider.credential}`,
                })),
              },
              {
                type: "dropdown",
                name: "healthPlanOnFile",
                title: "Plan on file",
                choices: HEALTH_PLANS.map((plan) => ({ value: plan.id, text: plan.name })),
              },
              {
                type: "text",
                name: "memberIdOnFile",
                title: "Member ID",
                description: "Blank means we have no card, and the form asks for one.",
                startWithNewLine: false,
              },
              { type: "text", name: "groupNumberOnFile", title: "Group number" },
              {
                type: "dropdown",
                name: "preferredLanguage",
                title: "Preferred language",
                startWithNewLine: false,
                choices: [...CLINIC_LANGUAGES],
              },
              {
                type: "boolean",
                name: "needsInterpreter",
                title: "Interpreter on the record?",
                labelTrue: "Yes",
                labelFalse: "No",
              },
              {
                type: "checkbox",
                name: "conditions",
                title: "Problem list",
                description: "The follow-up question offers exactly these.",
                colCount: 2,
                choices: CHART_CONDITIONS.map((condition) => ({
                  value: condition.id,
                  text: condition.label,
                })),
              },
              {
                type: "checkbox",
                name: "medications",
                title: "Current medications",
                colCount: 2,
                choices: CHART_MEDICATIONS.map((medication) => ({
                  value: medication.id,
                  text: medication.label,
                })),
              },
              {
                type: "boolean",
                name: "openRefills",
                title: "Refills available?",
                labelTrue: "Yes",
                labelFalse: "No",
              },
            ],
          },
        ],
      },
    ],
  },
  defaults: {
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
    needsInterpreter: true,
    healthPlanOnFile: "blueharbor",
    memberIdOnFile: "BH-88213041",
    groupNumberOnFile: "NW-4471",
    conditions: ["asthma", "hypertension"],
    medications: ["albuterol", "lisinopril"],
    openRefills: true,
  },
  toAccount: (data) => ({
    ...data,
    languageLabel:
      data.preferredLanguage === "en" ? "" : labelOf(CLINIC_LANGUAGES, data.preferredLanguage),
    healthPlanLabel:
      HEALTH_PLANS.find((plan) => plan.id === data.healthPlanOnFile)?.name ?? "",
  }),
};
