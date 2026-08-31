import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the Plan Finder (`planFinderJson`), used by the
 * embedded demo's toolbar.
 *
 * Chosen so the derived values land on the branch worth looking at: two
 * must-have modules push `recommendedPlan` to Business, which makes the live
 * currency estimate render (rather than one of the two html fallbacks) and
 * reveals the "included on Business" line in the summary. `emailMe` is true so
 * the conditional email field is visible too.
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const planFinderSample: SurveyData = {
  role: "Engineering lead",
  teamSize: 15,
  planningToday: "Jira or Linear",
  modules: {
    capacity: 2,
    portfolio: 2,
    insights: 1,
  },
  integrations: ["Slack", "GitHub", "Jira"],
  ssoRequired: false,
  selfHosted: false,
  startWhen: "This month",
  roadmapWishes: [
    "Deeper Jira sync",
    "A public API and webhooks",
    "Custom fields",
    "Time tracking",
    "Offline mode",
    "A native mobile app",
  ],
  anythingElse:
    "Rollups across projects are the one thing I still export to a spreadsheet for.",
  emailMe: true,
  contactEmail: "jordan.avery@example.com",
};
