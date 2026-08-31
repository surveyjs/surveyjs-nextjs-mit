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
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const cloudPlatformSample: SurveyData = {
  workload: "platform",
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
  compliance: ["soc2"],
  supportTier: "businessHours",
  startWhen: "This quarter",
  sendQuote: true,
  contactEmail: "jordan.avery@example.com",
};
