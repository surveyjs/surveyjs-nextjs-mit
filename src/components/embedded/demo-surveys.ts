import {
  checkoutSample,
  clinicVisitSample,
  cloudPlatformSample,
  coffeeFinderSample,
  customerSatisfactionSample,
  getSchemaDefinition,
  medicalFormSample,
  planFinderSample,
} from "@/schemas";
import type { DemoSurvey } from "./demo-controls";

/**
 * The definitions the embedded demos can hold, described once.
 *
 * Each demo route picks the ones that make sense for it and puts its own first —
 * `useDemoChrome` treats the first entry as the default, and the toolbar can swap
 * to any of the others. In the shop demo the switcher does more than swap a form:
 * the store has a product page and a cart, and each is built around one of these.
 */
export const DEMO_SURVEYS: Record<string, DemoSurvey> = {
  planFinder: {
    id: "plan-finder",
    label: "Plan finder",
    hint: "Recommends a plan and modules from the answers. The form a marketing page would really carry.",
    json: getSchemaDefinition("plan-finder").json,
    prefill: planFinderSample,
  },
  satisfaction: {
    id: "customer-satisfaction",
    label: "Satisfaction survey",
    hint: "The classic CSAT, in the same slot — same embedding, different JSON.",
    json: getSchemaDefinition("customer-satisfaction").json,
    prefill: customerSatisfactionSample,
  },
  cloudPlatform: {
    id: "cloud-platform",
    label: "Platform configurator",
    hint: "Prices a platform from the answers, and drives the page around it.",
    json: getSchemaDefinition("cloud-platform").json,
    prefill: cloudPlatformSample,
  },
  coffeeFinder: {
    id: "coffee-finder",
    label: "Coffee finder",
    hint: "Five one-click questions that pick the bag, the grind, the size and the schedule.",
    json: getSchemaDefinition("coffee-finder").json,
    prefill: coffeeFinderSample,
  },
  checkout: {
    id: "checkout",
    label: "Cart and checkout",
    hint: "The store's other page: a real checkout, with the order summary downstream of it.",
    json: getSchemaDefinition("checkout").json,
    prefill: checkoutSample,
  },
  clinicVisit: {
    id: "clinic-visit",
    label: "Appointment request",
    hint: "Estimates the copay, flags a needed referral and builds the what-to-bring list.",
    json: getSchemaDefinition("clinic-visit").json,
    prefill: clinicVisitSample,
  },
  patientIntake: {
    id: "medical-form",
    label: "New patient intake",
    hint: "The long clinical form a clinic texts you after the appointment is confirmed.",
    json: getSchemaDefinition("medical-form").json,
    prefill: medicalFormSample,
  },
};
