"use client";

import { useCallback, useMemo, useState } from "react";
import { quoteFor, type SurveyData } from "@/schemas";
import { cn } from "@/lib/utils";
import { DemoDock } from "./DemoDock";
import { OverlayPlacements, PlacementCallout } from "./DemoPlacements";
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import { SurveyJsonPanel } from "./SurveyJsonPanel";
import {
  ComparisonTable,
  ModuleGrid,
  PlanCards,
  PricingFaq,
  PricingFooter,
  PricingHeader,
  PricingIntro,
  QuotePanel,
} from "./CumuloraPricing";
import { useDemoChrome } from "./useDemoChrome";
import type { DemoSurvey } from "./demo-controls";

const ANCHOR = "configure";

/**
 * Embedded demo #3: a pricing page that re-prices itself from the survey.
 *
 * The other demos show that a SurveyJS form can look native inside somebody's
 * site. This one shows the thing that is actually hard to get elsewhere: the
 * survey model as the page's state. Every answer flows out through
 * `onDataChange`, `quoteFor` turns it into an itemised quote, and the page
 * re-renders around it — the quote panel, the recommended plan card, the module
 * grid, the highlighted column of the comparison table.
 *
 * Two details worth watching in a presentation:
 *  - Move the form into the side drawer from the toolbar, then answer. The page
 *    behind it re-prices live while the drawer is open.
 *  - "See my plan" scrolls to the recommended tier; "Change my answers" comes
 *    back with every answer still in place, because the survey is remounted with
 *    the data it already had rather than reset.
 */
export function CumuloraDemo({ surveys }: { surveys: readonly DemoSurvey[] }) {
  const chrome = useDemoChrome({ surveys, anchorId: ANCHOR });

  const [data, setData] = useState<SurveyData>({});
  const [submitted, setSubmitted] = useState(false);

  // Stable, so it never re-subscribes the survey's event handlers.
  const handleDataChange = useCallback((next: SurveyData) => setData(next), []);

  const quote = useMemo(() => quoteFor(data), [data]);

  const scrollToPlan = useCallback(() => {
    document
      .getElementById(`plan-${quote.plan.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [quote.plan.id]);

  const handleComplete = useCallback(
    (next: SurveyData) => {
      setData(next);
      setSubmitted(true);
      // The result is a place on the page, not a thank-you screen.
      requestAnimationFrame(() =>
        document
          .getElementById(`plan-${quoteFor(next).plan.id}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    },
    [],
  );

  const changeAnswers = useCallback(() => {
    setSubmitted(false);
    chrome.resumeWith(data);
  }, [chrome, data]);

  const survey = (
    <EmbeddedSurvey
      key={chrome.runKey}
      json={chrome.json}
      data={chrome.seed}
      onDataChange={handleDataChange}
      onComplete={handleComplete}
    />
  );

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <PricingHeader onConfigure={chrome.requestSurvey} />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="demo-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
            <PricingIntro />

            {/* Inline: form on the left, quote on the right, the way a real
                configurator reads. In an overlay placement the two swap, because
                a right-hand drawer would otherwise sit on top of the quote — and
                watching the quote keep up while the drawer is open is the single
                best thing to show in this demo. */}
            <div
              id={ANCHOR}
              className={cn(
                "grid scroll-mt-20 gap-8",
                chrome.placement === "inline"
                  ? "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
                  : "lg:grid-cols-2",
              )}
            >
              {chrome.placement === "inline" ? (
                <>
                  <div className="min-w-0">
                    <SurveyCard>{survey}</SurveyCard>
                  </div>
                  <QuotePanel
                    quote={quote}
                    submitted={submitted}
                    onSeePlan={scrollToPlan}
                  />
                </>
              ) : (
                <>
                  <QuotePanel
                    quote={quote}
                    submitted={submitted}
                    onSeePlan={scrollToPlan}
                  />
                  <div className="min-w-0">
                    <PlacementCallout
                      placement={chrome.placement}
                      title="Configure your platform"
                      onOpen={() => chrome.setOverlayOpen(true)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <PlanCards
          quote={quote}
          submitted={submitted}
          onChangeAnswers={changeAnswers}
        />
        <ModuleGrid
          selectedIds={Array.isArray(data.modules) ? (data.modules as string[]) : []}
        />
        <ComparisonTable quote={quote} />
        <PricingFaq />
      </main>

      <PricingFooter />

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
