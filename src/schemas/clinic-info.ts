import type { SurveyData } from "./types";

/**
 * Ridgeline Family Health — the locations, clinicians, services, accepted plans
 * and copays of a fictional US primary-care group, plus the function that turns
 * an appointment request into a visit summary.
 *
 * The point of holding all of it here: the appointment form's dropdowns are
 * generated from these lists, and the page's provider cards, location cards and
 * cost estimate render from the same ones. A clinic that listed a doctor in its
 * directory who was not offered in its booking form would be spotted in a second,
 * and that kind of seam is exactly what makes a mock look like a mock.
 *
 * Everything below is invented. Nothing here is medical advice, no real practice,
 * clinician, insurer or price is described, and the copay table is illustrative.
 */

export interface ClinicLocation {
  readonly id: string;
  readonly name: string;
  readonly address1: string;
  readonly address2?: string;
  readonly city: string;
  readonly state: string;
  readonly zip: string;
  readonly phone: string;
  readonly fax: string;
  readonly hours: readonly { readonly days: string; readonly time: string }[];
  readonly notes: string;
}

export const CLINIC_LOCATIONS: readonly ClinicLocation[] = [
  {
    id: "cedarpark",
    name: "Cedar Park",
    address1: "1180 Cedar Park Boulevard",
    address2: "Suite 210",
    city: "Portland",
    state: "OR",
    zip: "97214",
    phone: "(503) 555-0148",
    fax: "(503) 555-0149",
    hours: [
      { days: "Monday – Friday", time: "7:30 am – 6:00 pm" },
      { days: "Saturday", time: "9:00 am – 1:00 pm" },
      { days: "Sunday", time: "Closed" },
    ],
    notes: "Main campus. On-site lab and X-ray, walk-in urgent care until 8:00 pm.",
  },
  {
    id: "westbridge",
    name: "Westbridge",
    address1: "47 Westbridge Avenue",
    city: "Portland",
    state: "OR",
    zip: "97205",
    phone: "(503) 555-0162",
    fax: "(503) 555-0163",
    hours: [
      { days: "Monday – Friday", time: "8:00 am – 5:00 pm" },
      { days: "Saturday – Sunday", time: "Closed" },
    ],
    notes: "Primary care and behavioral health. Lab draws before 3:00 pm.",
  },
  {
    id: "marlowe",
    name: "Marlowe Pediatrics",
    address1: "900 Marlowe Street",
    address2: "Suite 3",
    city: "Beaverton",
    state: "OR",
    zip: "97005",
    phone: "(503) 555-0177",
    fax: "(503) 555-0178",
    hours: [
      { days: "Monday – Friday", time: "8:00 am – 5:30 pm" },
      { days: "Saturday", time: "9:00 am – 12:00 pm (sick visits only)" },
    ],
    notes: "Newborn through 18. Separate well and sick waiting rooms.",
  },
];

export function getLocation(id: string): ClinicLocation | undefined {
  return CLINIC_LOCATIONS.find((location) => location.id === id);
}

export interface Provider {
  readonly id: string;
  readonly name: string;
  readonly credential: string;
  readonly specialty: string;
  readonly locationIds: readonly string[];
  readonly languages: readonly string[];
  readonly acceptingNew: boolean;
  readonly boardCertified: string;
  /** Which visit categories this clinician takes. */
  readonly categories: readonly string[];
}

export const PROVIDERS: readonly Provider[] = [
  {
    id: "navarro",
    name: "Alicia Navarro",
    credential: "MD",
    specialty: "Family medicine",
    locationIds: ["cedarpark", "westbridge"],
    languages: ["English", "Spanish"],
    acceptingNew: true,
    boardCertified: "American Board of Family Medicine",
    categories: ["wellness", "illness", "followUp", "vaccination"],
  },
  {
    id: "okonjo",
    name: "Peter Okonjo",
    credential: "MD",
    specialty: "Internal medicine",
    locationIds: ["cedarpark"],
    languages: ["English"],
    acceptingNew: true,
    boardCertified: "American Board of Internal Medicine",
    categories: ["wellness", "illness", "followUp"],
  },
  {
    id: "weiss",
    name: "Hannah Weiss",
    credential: "DO",
    specialty: "Pediatrics",
    locationIds: ["marlowe"],
    languages: ["English", "German"],
    acceptingNew: true,
    boardCertified: "American Board of Pediatrics",
    categories: ["wellness", "illness", "vaccination"],
  },
  {
    id: "lindqvist",
    name: "Maya Lindqvist",
    credential: "FNP-C",
    specialty: "Family nurse practitioner",
    locationIds: ["cedarpark", "westbridge", "marlowe"],
    languages: ["English", "Swedish"],
    acceptingNew: true,
    boardCertified: "American Academy of Nurse Practitioners",
    categories: ["wellness", "illness", "followUp", "vaccination"],
  },
  {
    id: "reyes",
    name: "Samuel Reyes",
    credential: "MD",
    specialty: "Behavioral health",
    locationIds: ["westbridge"],
    languages: ["English", "Spanish"],
    acceptingNew: false,
    boardCertified: "American Board of Psychiatry and Neurology",
    categories: ["behavioral", "followUp"],
  },
  {
    id: "abara",
    name: "Ruth Abara",
    credential: "PA-C",
    specialty: "Urgent care",
    locationIds: ["cedarpark"],
    languages: ["English"],
    acceptingNew: true,
    boardCertified: "National Commission on Certification of Physician Assistants",
    categories: ["illness"],
  },
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((provider) => provider.id === id);
}

export interface ClinicService {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly bullets: readonly string[];
}

export const CLINIC_SERVICES: readonly ClinicService[] = [
  {
    id: "primary",
    name: "Primary care",
    blurb: "One clinician who knows your history, for everything that is not an emergency.",
    bullets: ["Annual physicals", "Chronic condition management", "Referrals and prior auth"],
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    blurb: "Newborn through eighteen, with separate well and sick waiting rooms.",
    bullets: ["Well-child visits", "Immunizations", "School and sports forms"],
  },
  {
    id: "womens",
    name: "Women's health",
    blurb: "Routine screening and prenatal care, with same-week appointments.",
    bullets: ["Well-woman exams", "Contraception", "Prenatal and postpartum"],
  },
  {
    id: "behavioral",
    name: "Behavioral health",
    blurb: "Therapy and medication management, in person or by video.",
    bullets: ["Anxiety and depression", "ADHD evaluation", "Medication review"],
  },
  {
    id: "labs",
    name: "Labs and imaging",
    blurb: "Drawn and read on site, so most results are back the same day.",
    bullets: ["Blood work", "X-ray", "EKG"],
  },
  {
    id: "urgent",
    name: "Urgent care",
    blurb: "Walk in until 8:00 pm at Cedar Park for anything that will not wait.",
    bullets: ["Sprains and stitches", "Infections", "Rapid testing"],
  },
];

/* ── coverage ───────────────────────────────────────────────────────────────── */

export interface HealthPlan {
  readonly id: string;
  readonly name: string;
  readonly copayPrimary: number;
  readonly copaySpecialist: number;
  readonly copayUrgent: number;
  /** HMO plans need a referral from the assigned primary-care clinician. */
  readonly referralRequired: boolean;
}

export const HEALTH_PLANS: readonly HealthPlan[] = [
  {
    id: "meridian",
    name: "Meridian Health PPO",
    copayPrimary: 25,
    copaySpecialist: 45,
    copayUrgent: 60,
    referralRequired: false,
  },
  {
    id: "blueharbor",
    name: "Blue Harbor HMO",
    copayPrimary: 15,
    copaySpecialist: 35,
    copayUrgent: 50,
    referralRequired: true,
  },
  {
    id: "evergreen",
    name: "Evergreen Choice PPO",
    copayPrimary: 30,
    copaySpecialist: 55,
    copayUrgent: 75,
    referralRequired: false,
  },
  {
    id: "statecare",
    name: "StateCare Advantage (Medicare)",
    copayPrimary: 0,
    copaySpecialist: 20,
    copayUrgent: 25,
    referralRequired: false,
  },
  {
    id: "medicaid",
    name: "State Medicaid",
    copayPrimary: 0,
    copaySpecialist: 0,
    copayUrgent: 0,
    referralRequired: true,
  },
];

export function getPlan(id: string): HealthPlan | undefined {
  return HEALTH_PLANS.find((plan) => plan.id === id);
}

/** Transparent self-pay pricing — the thing US patients actually hunt for. */
export const SELF_PAY_PRICES: readonly { readonly label: string; readonly price: number }[] = [
  { label: "Office visit, 20 minutes", price: 149 },
  { label: "Annual physical", price: 229 },
  { label: "Urgent care visit", price: 189 },
  { label: "Behavioral health, 50 minutes", price: 195 },
];

export interface VisitReason {
  readonly id: string;
  readonly label: string;
  /** Which copay column applies. */
  readonly category: "primary" | "specialist" | "urgent";
  readonly providerCategory: string;
}

export const VISIT_REASONS: readonly VisitReason[] = [
  {
    id: "wellness",
    label: "Annual physical or wellness visit",
    category: "primary",
    providerCategory: "wellness",
  },
  {
    id: "illness",
    label: "A new problem or illness",
    category: "primary",
    providerCategory: "illness",
  },
  {
    id: "followUp",
    label: "Follow-up on something we are already treating",
    category: "primary",
    providerCategory: "followUp",
  },
  {
    id: "vaccination",
    label: "Vaccination or travel visit",
    category: "primary",
    providerCategory: "vaccination",
  },
  {
    id: "behavioral",
    label: "Behavioral health",
    category: "specialist",
    providerCategory: "behavioral",
  },
  {
    id: "urgentCare",
    label: "Urgent — something that will not wait",
    category: "urgent",
    providerCategory: "illness",
  },
];

export function getVisitReason(id: string): VisitReason | undefined {
  return VISIT_REASONS.find((reason) => reason.id === id);
}

export const PREFERRED_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const PREFERRED_TIMES: readonly { readonly value: string; readonly text: string }[] = [
  { value: "morning", text: "Morning · 7:30 am – 11:30 am" },
  { value: "midday", text: "Midday · 11:30 am – 2:00 pm" },
  { value: "afternoon", text: "Afternoon · 2:00 pm – 6:00 pm" },
  { value: "any", text: "Any time you have" },
];

/* ── the derived summary ────────────────────────────────────────────────────── */

export interface VisitSummary {
  readonly started: boolean;
  readonly reason: VisitReason | undefined;
  readonly location: ClinicLocation | undefined;
  readonly provider: Provider | undefined;
  readonly plan: HealthPlan | undefined;
  readonly selfPay: boolean;
  /** Estimated out-of-pocket cost for the visit, or null when unknown. */
  readonly estimate: number | null;
  readonly estimateLabel: string;
  readonly whenText: string;
  readonly newPatient: boolean;
  readonly urgent: boolean;
  readonly referralNeeded: boolean;
  /** What to bring, adapted to the answers. */
  readonly bring: readonly string[];
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/**
 * Turns an appointment request into the summary the page shows beside the form.
 *
 * Pure function of `data`, called on every answer change; the page memoises it.
 * The cost estimate is the line that matters — "what will this visit cost me" is
 * the question every US patient is actually asking, and answering it from the
 * plan and the reason they just picked is worth more than any hero image.
 */
export function visitSummaryFor(data: SurveyData): VisitSummary {
  const reason = getVisitReason(typeof data.visitReason === "string" ? data.visitReason : "");
  const location = getLocation(typeof data.location === "string" ? data.location : "");
  const providerId = typeof data.provider === "string" ? data.provider : "";
  const provider = providerId === "any" ? undefined : getProvider(providerId);
  const selfPay = data.coverage === "selfPay";
  const plan = selfPay ? undefined : getPlan(typeof data.healthPlan === "string" ? data.healthPlan : "");
  const newPatient = data.newPatient === true;
  const urgent = reason?.id === "urgentCare" || data.timeframe === "asap";

  const days = asArray(data.preferredDays);
  const timeChoice = typeof data.preferredTime === "string" ? data.preferredTime : "";
  const time = PREFERRED_TIMES.find((entry) => entry.value === timeChoice);

  const started = Boolean(
    reason || location || providerId || data.coverage || days.length > 0 || timeChoice,
  );

  let estimate: number | null = null;
  let estimateLabel = "Pick a reason and how you are paying, and we will estimate it.";

  if (selfPay && reason) {
    const price =
      reason.id === "wellness"
        ? 229
        : reason.category === "urgent"
          ? 189
          : reason.id === "behavioral"
            ? 195
            : 149;
    estimate = price;
    estimateLabel = "Self-pay, due at check-in. No claim is filed.";
  } else if (plan && reason) {
    estimate =
      reason.category === "urgent"
        ? plan.copayUrgent
        : reason.category === "specialist"
          ? plan.copaySpecialist
          : plan.copayPrimary;
    estimateLabel =
      estimate === 0
        ? `${plan.name} covers this visit in full. Nothing due at check-in.`
        : `Your ${plan.name} copay for this visit. Anything beyond it is billed to the plan.`;
  }

  const whenText = (() => {
    const dayPart =
      days.length === 0
        ? "any day"
        : days.length === 1
          ? days[0]
          : `${days.slice(0, -1).join(", ")} or ${days[days.length - 1]}`;
    const timePart = time && time.value !== "any" ? time.text.split(" · ")[1] : "any time";
    return `${dayPart}, ${timePart}`;
  })();

  const bring: string[] = ["A photo ID"];
  if (!selfPay) bring.push("Your insurance card");
  if (newPatient) {
    bring.push("A list of your current medications and doses");
    bring.push("Records or immunizations from your previous clinic, if you have them");
  }
  if (reason?.id === "wellness") bring.push("Any home blood-pressure or glucose readings");
  if (reason?.id === "behavioral") bring.push("Names of any medications you have tried before");
  if (selfPay) bring.push("A card for payment at check-in");

  return {
    started,
    reason,
    location,
    provider,
    plan,
    selfPay,
    estimate,
    estimateLabel,
    whenText,
    newPatient,
    urgent,
    referralNeeded: Boolean(plan?.referralRequired && reason?.category === "specialist"),
    bring,
  };
}

export function formatDollars(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
