import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the Customer Satisfaction Survey
 * (`customerSatisfactionJson`), used by the embedded demo's toolbar.
 *
 * Answers every page so a reviewer can jump to the last step and see the piped
 * summary and the conditional follow-up panel without typing. `allowFollowUp`
 * is deliberately true so the email branch renders.
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const customerSatisfactionSample: SurveyData = {
  overallSatisfaction: 4,
  aspectRatings: {
    speed: 4,
    reliability: 4,
    support: 3,
    value: 3,
  },
  usagePeriod: "Six months to a year",
  likedFeatures: ["Ease of use", "Speed", "Integrations"],
  improvementAreas: ["Price", "Customer support"],
  additionalFeedback:
    "Rollups across projects are the one thing I still export to a spreadsheet for.",
  recommendationScore: 5,
  allowFollowUp: true,
  contactEmail: "jordan.avery@example.com",
};
