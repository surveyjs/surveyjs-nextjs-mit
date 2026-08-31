"use client";

import { useCallback, useMemo, useState } from "react";
import { visitSummaryFor, type SurveyData } from "@/schemas";
import { cn } from "@/lib/utils";
import { DemoDock } from "./DemoDock";
import { OverlayPlacements, PlacementCallout } from "./DemoPlacements";
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import { SurveyJsonPanel } from "./SurveyJsonPanel";
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
import type { DemoSurvey } from "./demo-controls";

const ANCHOR = "request";
const INTAKE_ID = "medical-form";
export const RIDGELINE_BRAND = "emerald";
const BRAND = RIDGELINE_BRAND;

/**
 * Embedded demo: a US clinic page whose appointment form prices the visit.
 *
 * Healthcare is where SurveyJS actually gets bought, and this is the page it gets
 * bought for — so the site around the form is built to the conventions a US
 * patient reads without noticing: the utility bar, the provider directory with
 * credentials, in-network plans, posted self-pay prices, the statutory notices.
 *
 * The mechanic is the one from the Cumulora demo, pointed at a question patients
 * care about more than any other: **what will this visit cost me.** Every answer
 * flows out through `onDataChange`, `visitSummaryFor` derives the copay, the
 * referral warning and the what-to-bring list, and the page re-renders around it —
 * including the provider card and the office card the request names.
 *
 * The toolbar carries a second definition, the full new-patient intake, because
 * the pair is the honest story of a clinic: a short public request form, and a
 * long clinical one sent afterwards. Same embedding, same styling, no bespoke CSS
 * for either.
 */
export function RidgelineDemo({ surveys }: { surveys: readonly DemoSurvey[] }) {
  const chrome = useDemoChrome({ surveys, anchorId: ANCHOR, brandId: BRAND });

  const [data, setData] = useState<SurveyData>({});
  const [submitted, setSubmitted] = useState(false);

  const isIntake = chrome.activeSurvey.id === INTAKE_ID;

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

  const survey = (
    <EmbeddedSurvey
      key={chrome.runKey}
      json={chrome.json}
      data={chrome.seed}
      onDataChange={isIntake ? undefined : handleDataChange}
      onComplete={isIntake ? undefined : handleComplete}
    />
  );

  const inline = chrome.placement === "inline";

  const sidePanel = isIntake ? (
    <IntakeNote />
  ) : (
    <VisitSummaryPanel
      summary={summary}
      submitted={submitted}
      onChangeAnswers={changeAnswers}
    />
  );

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <ClinicUtilityBar />
      <ClinicHeader onRequest={chrome.requestSurvey} />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="demo-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-14">
            <ClinicIntro />

            {/* Form left, summary right — and the two swap in an overlay
                placement, because a right-hand drawer would otherwise land on
                top of the panel that is the whole point of watching. */}
            <div
              id={ANCHOR}
              className={cn(
                "grid scroll-mt-24 gap-8",
                inline
                  ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
                  : "lg:grid-cols-2",
              )}
            >
              {inline ? (
                <>
                  <div className="min-w-0">
                    <SurveyCard>{survey}</SurveyCard>
                  </div>
                  {sidePanel}
                </>
              ) : (
                <>
                  {sidePanel}
                  <div className="min-w-0">
                    <PlacementCallout
                      placement={chrome.placement}
                      title={chrome.activeSurvey.label}
                      onOpen={() => chrome.setOverlayOpen(true)}
                    />
                  </div>
                </>
              )}
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

      <OverlayPlacements
        placement={chrome.placement}
        open={chrome.overlayOpen}
        onOpenChange={chrome.setOverlayOpen}
        label={chrome.activeSurvey.label}
      >
        {survey}
      </OverlayPlacements>

      <SurveyJsonPanel {...chrome.jsonPanelProps} />
      <DemoDock {...chrome.dockProps} />
    </div>
  );
}

/**
 * What sits where the visit summary usually is while the long intake form is
 * loaded. The intake has no cost to estimate — it is the form a patient fills in
 * *after* the appointment exists — so the panel says so rather than sitting empty.
 */
function IntakeNote() {
  return (
    <aside aria-label="About this form" className="bg-card sticky top-24 rounded-xl border p-5 shadow-sm">
      <h2 className="text-[15px] font-semibold">New patient intake</h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        This is the second form a clinic needs, and the one patients used to fill in on a clipboard
        in the waiting room: history, medications, allergies, insurance, consents and a signature.
        Ridgeline texts a link to it once the appointment is confirmed.
      </p>
      <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
        <li>· A matrix of past diagnoses, one row per condition.</li>
        <li>· A dynamic table of allergies the patient adds rows to.</li>
        <li>· Consent to treatment and a HIPAA acknowledgement, both required.</li>
      </ul>
      <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
        Same page, same embedding, same shadcn adapter as the short request form beside it — switch
        back with the toolbar at the bottom of the screen.
      </p>
    </aside>
  );
}
