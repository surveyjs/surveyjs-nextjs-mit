import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the appointment request (`clinicVisitJson`).
 *
 * Chosen to light up every branch worth looking at in one click: behavioral
 * health is the visit category that bills at the specialist copay, and the HMO
 * plan is the one that needs a referral — so the summary beside the form shows a
 * $35 estimate *and* the referral warning, rather than the happy path. A new
 * patient needing an interpreter also opens the two conditional questions and
 * lengthens the "what to bring" list.
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const clinicVisitSample: SurveyData = {
  visitReason: "behavioral",
  timeframe: "thisWeek",
  location: "westbridge",
  provider: "reyes",
  preferredDays: ["Tuesday", "Thursday"],
  preferredTime: "afternoon",
  telehealth: true,
  firstName: "Jordan",
  lastName: "Avery",
  preferredName: "Jordy",
  dateOfBirth: "1989-04-17",
  phone: "(503) 555-0134",
  email: "jordan.avery@example.com",
  newPatient: true,
  needsInterpreter: true,
  interpreterLanguage: "Spanish",
  coverage: "insurance",
  healthPlan: "blueharbor",
  memberId: "BH-4471902",
  groupNumber: "OR-2210",
  cardOnFile: false,
  consentToContact: true,
  privacyAcknowledged: true,
};
