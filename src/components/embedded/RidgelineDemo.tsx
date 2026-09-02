"use client";

import { useCallback, useMemo, useState } from "react";
import { visitSummaryFor, type SurveyData } from "@/schemas";
import { DemoDock } from "./DemoDock";
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import {
  ClinicFooter,
  ClinicHeader,
  ClinicIntro,
  ClinicUtilityBar,
  CoverageSection,
  LocationCards,
  NewPatientSection,
  ProviderDirectory,
  ServiceGrid,
  VisitSummaryPanel,
} from "./RidgelineSite";
import { useDemoChrome } from "./useDemoChrome";
import { RIDGELINE_USER } from "./demo-accounts";
import { CLINIC_PATIENTS } from "@/schemas";
import type { DemoSurvey } from "./demo-controls";

const ANCHOR = "request";
/** The practice's own back office, where this form and these charts live. */
const CLINIC_ADMIN = "/clinic-admin";
export const RIDGELINE_BRAND = "emerald";

/**
 * Embedded demo: a US clinic page whose appointment form prices the visit.
 *
 * Healthcare is where SurveyJS actually gets bought, and this is the page it gets
 * bought for — so the site around the form is built to the conventions a US
 * patient reads without noticing: the utility bar, the provider directory with
 * credentials, in-network plans, posted self-pay prices, the statutory notices.
 *
 * Two mechanics run at once here. The page is downstream of the form: every
 * answer flows out through `onDataChange`, `visitSummaryFor` derives the copay,
 * the referral warning and the what-to-bring list, and the page re-renders around
 * it — including the provider card and the office card the request names.
 *
 * And the form is downstream of the patient. A portal knows who you are, so the
 * office, the clinician, the plan and the identity fields all arrive filled, the
 * insurance-card fields are absent while a card is on file, and the questions
 * about existing conditions and refills are built from that patient's own chart.
 * Turn on "First visit to Ridgeline?" in the user popup and watch it invert: the
 * chart empties, Maria's four confirmations become the long form, and a page
 * appears that established patients never see.
 */
export function RidgelineDemo({ survey }: { survey: DemoSurvey }) {
  const chrome = useDemoChrome({
    survey,
    user: RIDGELINE_USER,
    anchorId: ANCHOR,
    brandId: RIDGELINE_BRAND,
    // The practice owns its records: the toolbar signs in as one of the patients
    // the admin portal keeps, and changes nothing about them.
    roster: CLINIC_PATIENTS,
    admin: CLINIC_ADMIN,
    allowUserEdit: false,
  });

  const [data, setData] = useState<SurveyData>({});
  const [submitted, setSubmitted] = useState(false);

  // Stable, so it never re-subscribes the survey's event handlers.
  const handleDataChange = useCallback((next: SurveyData) => setData(next), []);

  const summary = useMemo(() => visitSummaryFor(data), [data]);

  const handleComplete = useCallback((next: SurveyData) => {
    setData(next);
    setSubmitted(true);
    const derived = visitSummaryFor(next);
    // The result is a place on the page: the clinician who will see them, or
    // failing that the office they are going to.
    const target = derived.provider
      ? `provider-${derived.provider.id}`
      : derived.location
        ? `location-${derived.location.id}`
        : null;
    if (!target) return;
    requestAnimationFrame(() =>
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, []);

  const changeAnswers = useCallback(() => {
    setSubmitted(false);
    chrome.resumeWith(data);
  }, [chrome, data]);

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <ClinicUtilityBar />
      <ClinicHeader onRequest={chrome.requestSurvey} account={chrome.account} />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="demo-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-14">
            <ClinicIntro />

            {/* Form left, summary right: the estimate has to be beside the
                question that changes it. */}
            <div
              id={ANCHOR}
              className="grid scroll-mt-24 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
            >
              <div className="min-w-0">
                <SurveyCard>
                  <EmbeddedSurvey
                    key={chrome.runKey}
                    json={chrome.json}
                    data={chrome.seed}
                    variables={chrome.variables}
                    onDataChange={handleDataChange}
                    onComplete={handleComplete}
                  />
                </SurveyCard>
              </div>
              <VisitSummaryPanel
                summary={summary}
                submitted={submitted}
                onChangeAnswers={changeAnswers}
              />
            </div>
          </div>
        </section>

        <ServiceGrid />
        <ProviderDirectory selectedId={summary.provider?.id ?? null} />
        <LocationCards selectedId={summary.location?.id ?? null} />
        <CoverageSection summary={summary} />
        <NewPatientSection onRequest={chrome.requestSurvey} />
      </main>

      <ClinicFooter />

      {/* The clinic site has its own light/dark control in its utility bar. */}
      <DemoDock {...chrome.dockProps} showTheme={false} />
    </div>
  );
}
