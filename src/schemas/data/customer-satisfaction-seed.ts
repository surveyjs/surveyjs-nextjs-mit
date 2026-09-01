import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the Customer Satisfaction Survey
 * (`customerSatisfactionJson`), used by the embedded demo's toolbar.
 *
 * Answers every page so a reviewer can jump to the last step and see the piped
 * summary without typing. It deliberately answers the questions that only exist
 * for *some* accounts too — `planFit` for paying customers, `firstTask` for brand
 * new ones — so switching user with a prefilled form shows the arrangement
 * changing rather than a form emptying out.
 *
 * Two fields are missing on purpose: `usagePeriod`, which the definition works
 * out from the account's `monthsActive`, and `contactEmail`, which is skipped
 * whenever the account already has an address.
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
  firstTask: "Track my team's work",
  setupBlocked: true,
  setupBlocker: "Inviting the team needed an admin I had to wait for.",
  likedFeatures: ["Ease of use", "Speed", "Integrations"],
  improvementAreas: ["Price", "Customer support"],
  planFit: "small",
  upgradeBlocker: "Shared dashboards for people who do not need a seat.",
  additionalFeedback:
    "Rollups across projects are the one thing I still export to a spreadsheet for.",
  supportFollowUp: 3,
  supportDetail: "The first reply asked for logs I had already attached.",
  csmRating: 5,
  renewalIntent: "likely",
  recommendationScore: 5,
  allowFollowUp: true,
};
