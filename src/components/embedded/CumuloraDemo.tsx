"use client";

import { useCallback, useMemo, useState } from "react";
import { quoteFor, type SurveyData } from "@/schemas";
import { DemoDock } from "./DemoDock";
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import { DemoUserDialog } from "./DemoUserDialog";
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
import { CUMULORA_USER } from "./demo-accounts";
import type { DemoSurvey } from "./demo-controls";

const ANCHOR = "configure";
export const CUMULORA_BRAND = "rose";

/**
 * Embedded demo: a pricing page that re-prices itself from the survey.
 *
 * The feedback demo shows that a SurveyJS form can look native inside somebody's
 * site. This one shows the thing that is actually hard to get elsewhere: the
 * survey model as the page's state. Every answer flows out through
 * `onDataChange`, `quoteFor` turns it into an itemised quote, and the page
 * re-renders around it — the quote panel, the recommended plan card, the module
 * grid, the highlighted column of the comparison table.
 *
 * On top of that it opens on the account rather than on an empty form: the
 * project count is sized from the company's headcount, the compliance boxes come
 * from the record, an existing customer is asked what they are changing, and an
 * EU account gets an entire data-residency page that a US one never sees.
 *
 * Two details worth watching in a presentation:
 *  - open "Edit the user" and switch the region to the EU: the price stays, the
 *    answers stay, and the progress bar grows a residency step;
 *  - "See my plan" scrolls to the recommended tier; "Change my answers" comes
 *    back with every answer still in place, because the survey is remounted with
 *    the data it already had rather than reset.
 */
export function CumuloraDemo({ survey }: { survey: DemoSurvey }) {
  const chrome = useDemoChrome({
    survey,
    user: CUMULORA_USER,
    anchorId: ANCHOR,
    brandId: CUMULORA_BRAND,
  });

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

  const handleComplete = useCallback((next: SurveyData) => {
    setData(next);
    setSubmitted(true);
    // The result is a place on the page, not a thank-you screen.
    requestAnimationFrame(() =>
      document
        .getElementById(`plan-${quoteFor(next).plan.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, []);

  const changeAnswers = useCallback(() => {
    setSubmitted(false);
    chrome.resumeWith(data);
  }, [chrome, data]);

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <PricingHeader onConfigure={chrome.requestSurvey} account={chrome.account} />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="demo-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto w-full max-w-6xl px-6 pb-16">
            <PricingIntro />

            {/* Form on the left, quote on the right, the way a real configurator
                reads. */}
            <div
              id={ANCHOR}
              className="grid scroll-mt-20 gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]"
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
              <QuotePanel quote={quote} submitted={submitted} onSeePlan={scrollToPlan} />
            </div>
          </div>
        </section>

        <PlanCards quote={quote} submitted={submitted} onChangeAnswers={changeAnswers} />
        <ModuleGrid
          selectedIds={Array.isArray(data.modules) ? (data.modules as string[]) : []}
        />
        <ComparisonTable quote={quote} />
        <PricingFaq />
      </main>

      <PricingFooter />

      <DemoUserDialog {...chrome.userDialogProps} />
      <DemoDock {...chrome.dockProps} />
    </div>
  );
}
