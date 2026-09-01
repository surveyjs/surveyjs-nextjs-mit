import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the appointment request (`clinicVisitJson`).
 *
 * Chosen to light up every branch worth looking at in one click: behavioral
 * health is the visit category that bills at the specialist copay, so the summary
 * beside the form shows a real estimate — and for a patient on an HMO it shows the
 * referral warning with it, rather than the happy path.
 *
 * What it deliberately does *not* contain is anything the chart already knows:
 * the name, the date of birth, the phone, the office, the clinician, the plan and
 * the member ID all come from the signed-in patient, and typing them in here
 * would hide the very thing the demo is for. Switch user with a prefilled form
 * and the copay, the warning and the what-to-bring list all move.
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const clinicVisitSample: SurveyData = {
  visitReason: "behavioral",
  relatedToChart: false,
  timeframe: "thisWeek",
  preferredDays: ["Tuesday", "Thursday"],
  preferredTime: "afternoon",
  telehealth: true,
  previousClinic: "Alder Street Family Practice",
  recordsRelease: true,
  referralSource: "My insurance directory",
  emergencyContactName: "Dana Whitfield",
  emergencyContactPhone: "(503) 555-0175",
  consentToContact: true,
  privacyAcknowledged: true,
};
