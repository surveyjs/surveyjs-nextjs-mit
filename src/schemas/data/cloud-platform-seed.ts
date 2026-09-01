import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the Cloud Platform configurator
 * (`cloudPlatformJson`), used by the embedded demo's toolbar.
 *
 * Tuned to land on the most interesting quote: 2 TB and SSO push the tier to
 * Business, three environments of different sizes exercise the dynamic panel and
 * the compute line, two modules reveal their follow-up questions, and SOC 2 adds
 * a compliance line. Every line of the itemised quote is populated except the
 * storage overage, which Business's 2 TB allowance just covers — the one branch
 * worth leaving unlit so the allowance is visibly doing something.
 *
 * It also answers the questions that exist for only some accounts — `changeType`
 * for a customer, `evaluationStage` for a prospect, the residency page for an EU
 * one — so switching user on a filled form shows the shape changing rather than
 * the form emptying. `compliance` and the email are left out: those come from the
 * account.
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const cloudPlatformSample: SurveyData = {
  changeType: "environments",
  evaluationStage: "shortlist",
  workload: "platform",
  // Deliberately answered, even though the definition would size it from the
  // account's headcount: the quote below is the one the docs quote, and Prefill
  // has to land on it for every account. Open the page without Prefill to see the
  // account-derived value instead.
  projects: 25,
  dataVolumeGb: 2000,
  environments: [
    { envName: "production", envSize: "large", envAlwaysOn: true },
    { envName: "staging", envSize: "medium", envAlwaysOn: false },
    { envName: "sandbox", envSize: "small", envAlwaysOn: false },
  ],
  modules: ["streams", "warehouse"],
  peakEventsPerSecond: "10,000 to 100,000",
  queryConcurrency: "10 to 50",
  ssoRequired: true,
  selfHosted: false,
  baaRequired: true,
  supportTier: "businessHours",
  dataRegion: "frankfurt",
  dpaRequired: true,
  subprocessorReview: true,
  startWhen: "This quarter",
  sendQuote: true,
};
