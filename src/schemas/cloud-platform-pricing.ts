import type { SurveyData } from "./types";

/**
 * The price list of a fictional cloud data platform, and the function that turns
 * a set of survey answers into an itemised quote.
 *
 * This is the single source of truth for the Cloud Platform demo: the survey JSON
 * (`cloud-platform.ts`) builds its choices and labels from these constants, and
 * the pricing page renders its plan cards, module grid and live quote from the
 * same ones. Neither can drift from the other, and a price changes in one place.
 *
 * The money lives here rather than in survey `calculatedValues` on purpose: the
 * demo needs a *list of lines with labels*, which an expression string cannot
 * express. The survey JSON keeps everything that is genuinely form logic —
 * branching, dynamic panels, validation, the editable preview step.
 */

export type CloudPlanId = "sandbox" | "team" | "business" | "enterprise";

export interface CloudPlan {
  readonly id: CloudPlanId;
  readonly name: string;
  /** Monthly platform fee, or null when the tier is quoted rather than listed. */
  readonly price: number | null;
  readonly tagline: string;
  /** Included projects, or null for unlimited. */
  readonly projects: number | null;
  /** Included storage in GB, or null for unlimited. */
  readonly storageGb: number | null;
  readonly support: string;
  readonly sso: boolean;
  readonly selfHost: boolean;
}

export const CLOUD_PLANS: readonly CloudPlan[] = [
  {
    id: "sandbox",
    name: "Sandbox",
    price: 0,
    tagline: "One project, enough room to prove it works.",
    projects: 1,
    storageGb: 5,
    support: "Community",
    sso: false,
    selfHost: false,
  },
  {
    id: "team",
    name: "Team",
    price: 299,
    tagline: "A working data platform for one team.",
    projects: 5,
    storageGb: 250,
    support: "Email, next business day",
    sso: false,
    selfHost: false,
  },
  {
    id: "business",
    name: "Business",
    price: 1200,
    tagline: "Several teams, and a security review to pass.",
    projects: 25,
    storageGb: 2000,
    support: "Business hours",
    sso: true,
    selfHost: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    tagline: "Your VPC, your SLA, our engineers.",
    projects: null,
    storageGb: null,
    support: "24/7, named engineer",
    sso: true,
    selfHost: true,
  },
];

export function getCloudPlan(id: CloudPlanId): CloudPlan {
  const plan = CLOUD_PLANS.find((candidate) => candidate.id === id);
  if (!plan) throw new Error(`Unknown cloud plan: ${id}`);
  return plan;
}

export interface CloudModule {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly blurb: string;
}

export const CLOUD_MODULES: readonly CloudModule[] = [
  {
    id: "streams",
    name: "Streams",
    price: 180,
    blurb: "Real-time ingestion with replay, so late events do not mean a backfill.",
  },
  {
    id: "warehouse",
    name: "Warehouse",
    price: 340,
    blurb: "Columnar analytics over the same tables your pipelines write.",
  },
  {
    id: "guard",
    name: "Guard",
    price: 150,
    blurb: "Data-quality checks that page you before a dashboard lies to someone.",
  },
  {
    id: "lineage",
    name: "Lineage",
    price: 220,
    blurb: "Column-level lineage and a catalog that stays true without curation.",
  },
];

/** Compute sizes an environment can run at, priced per environment per month. */
export const COMPUTE_SIZES: readonly { id: string; name: string; price: number }[] = [
  { id: "small", name: "Small — 2 vCPU", price: 60 },
  { id: "medium", name: "Medium — 8 vCPU", price: 180 },
  { id: "large", name: "Large — 32 vCPU", price: 520 },
];

export const SUPPORT_TIERS: readonly { id: string; name: string; price: number }[] = [
  { id: "standard", name: "Standard — included with your plan", price: 0 },
  { id: "businessHours", name: "Business hours — one-hour response", price: 400 },
  { id: "always", name: "24/7 — fifteen-minute response", price: 1400 },
];

export const COMPLIANCE_ADDONS: readonly { id: string; name: string; price: number }[] = [
  { id: "soc2", name: "SOC 2 Type II report", price: 250 },
  { id: "hipaa", name: "HIPAA business associate agreement", price: 600 },
  { id: "residency", name: "EU data residency", price: 350 },
];

/** Storage past the plan's allowance, per GB per month. */
export const STORAGE_OVERAGE_PER_GB = 0.09;

/** Data-volume choices, in GB. Used by the survey and by the quote. */
export const DATA_VOLUMES: readonly { value: number; text: string }[] = [
  { value: 5, text: "Under 5 GB" },
  { value: 250, text: "Around 250 GB" },
  { value: 2000, text: "Around 2 TB" },
  { value: 12000, text: "12 TB or more" },
];

export const PROJECT_COUNTS: readonly { value: number; text: string }[] = [
  { value: 1, text: "One" },
  { value: 5, text: "Up to 5" },
  { value: 25, text: "Up to 25" },
  { value: 80, text: "More than 25" },
];

export interface QuoteLine {
  readonly label: string;
  readonly detail?: string;
  readonly amount: number;
}

export interface CloudQuote {
  readonly plan: CloudPlan;
  /** Why this tier and not the one below it, in the visitor's own terms. */
  readonly reasons: readonly string[];
  readonly lines: readonly QuoteLine[];
  readonly monthly: number;
  /** True for Enterprise: the lines are real, the total is not ours to state. */
  readonly quotedOnly: boolean;
  /** False until the visitor has answered anything at all. */
  readonly started: boolean;
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface EnvironmentRow {
  envName?: string;
  envSize?: string;
}

/**
 * Turns survey answers into a quote.
 *
 * Called on every answer change, so it stays a pure function of `data` with no
 * memoisation of its own — the page memoises the result.
 */
export function quoteFor(data: SurveyData): CloudQuote {
  const projects = asNumber(data.projects);
  const volumeGb = asNumber(data.dataVolumeGb);
  const moduleIds = asArray(data.modules);
  const complianceIds = asArray(data.compliance);
  const ssoRequired = data.ssoRequired === true;
  const selfHosted = data.selfHosted === true;
  const environments: EnvironmentRow[] = Array.isArray(data.environments)
    ? (data.environments as EnvironmentRow[])
    : [];

  const started =
    projects > 0 ||
    volumeGb > 0 ||
    moduleIds.length > 0 ||
    complianceIds.length > 0 ||
    environments.length > 0 ||
    ssoRequired ||
    selfHosted;

  // ── which tier ─────────────────────────────────────────────────────────────
  const reasons: string[] = [];
  let planId: CloudPlanId = "sandbox";

  if (selfHosted) {
    planId = "enterprise";
    reasons.push("it has to run in your own VPC");
  } else if (projects > 25 || volumeGb > 2000 || environments.length > 10) {
    planId = "enterprise";
    if (projects > 25) reasons.push("more than 25 projects");
    if (volumeGb > 2000) reasons.push("more than 2 TB of data");
    if (environments.length > 10) reasons.push("more than ten environments");
  } else if (
    ssoRequired ||
    complianceIds.includes("hipaa") ||
    projects > 5 ||
    volumeGb > 250 ||
    moduleIds.length >= 3
  ) {
    planId = "business";
    if (ssoRequired) reasons.push("SSO is included from Business up");
    if (complianceIds.includes("hipaa")) reasons.push("a HIPAA BAA needs Business");
    if (projects > 5) reasons.push("more than five projects");
    if (volumeGb > 250) reasons.push("more than 250 GB of data");
    if (moduleIds.length >= 3) reasons.push("three modules or more");
  } else if (projects > 1 || volumeGb > 5 || moduleIds.length > 0 || environments.length > 0) {
    planId = "team";
    reasons.push("one team's worth of projects and data");
  } else if (started) {
    reasons.push("everything you asked for fits the free tier");
  }

  const plan = getCloudPlan(planId);
  const quotedOnly = plan.price === null;

  // ── the lines ──────────────────────────────────────────────────────────────
  const lines: QuoteLine[] = [];

  if (!quotedOnly) {
    lines.push({
      label: `${plan.name} platform`,
      detail: plan.support,
      amount: plan.price ?? 0,
    });
  }

  for (const entry of CLOUD_MODULES) {
    if (moduleIds.includes(entry.id)) {
      lines.push({ label: `${entry.name} module`, amount: entry.price });
    }
  }

  const computeTotal = environments.reduce((total, environment) => {
    const size = COMPUTE_SIZES.find((candidate) => candidate.id === environment.envSize);
    return total + (size?.price ?? 0);
  }, 0);
  if (computeTotal > 0) {
    lines.push({
      label: "Compute",
      detail: `${environments.length} ${environments.length === 1 ? "environment" : "environments"}`,
      amount: computeTotal,
    });
  }

  const allowance = plan.storageGb;
  const overageGb = allowance === null ? 0 : Math.max(0, volumeGb - allowance);
  if (overageGb > 0) {
    lines.push({
      label: "Storage over the allowance",
      detail: `${overageGb.toLocaleString("en-US")} GB at $${STORAGE_OVERAGE_PER_GB.toFixed(2)}`,
      amount: Math.round(overageGb * STORAGE_OVERAGE_PER_GB),
    });
  }

  const support = SUPPORT_TIERS.find((tier) => tier.id === data.supportTier);
  if (support && support.price > 0) {
    lines.push({ label: `${support.name.split(" — ")[0]} support`, amount: support.price });
  }

  for (const addon of COMPLIANCE_ADDONS) {
    if (complianceIds.includes(addon.id)) {
      lines.push({ label: addon.name, amount: addon.price });
    }
  }

  const monthly = lines.reduce((total, line) => total + line.amount, 0);

  return { plan, reasons, lines, monthly, quotedOnly, started };
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
