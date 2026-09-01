import {
  clinicVisitSample,
  cloudPlatformSample,
  customerSatisfactionSample,
  getSchemaDefinition,
} from "@/schemas";
import type { DemoSurvey } from "./demo-controls";

/**
 * The definition each embedded demo carries, described once.
 *
 * One per demo, on purpose: three host sites are already three different stories,
 * and a switcher inside each of them only invites the question of which one is
 * the real product.
 */
export const DEMO_SURVEYS: Record<string, DemoSurvey> = {
  satisfaction: {
    id: "customer-satisfaction",
    label: "Satisfaction survey",
    hint: "The classic CSAT, addressed to the account that is signed in.",
    json: getSchemaDefinition("customer-satisfaction").json,
    prefill: customerSatisfactionSample,
  },
  cloudPlatform: {
    id: "cloud-platform",
    label: "Platform configurator",
    hint: "Prices a platform from the answers, opening on the account's own numbers.",
    json: getSchemaDefinition("cloud-platform").json,
    prefill: cloudPlatformSample,
  },
  clinicVisit: {
    id: "clinic-visit",
    label: "Appointment request",
    hint: "Arrives filled in from the patient's chart, and asks less because of it.",
    json: getSchemaDefinition("clinic-visit").json,
    prefill: clinicVisitSample,
  },
};
