"use client";

import {
  AppPreview,
  ClosingBand,
  EmbedNotes,
  Features,
  Hero,
  Pricing,
  SiteFooter,
  SiteHeader,
  Stats,
  Suite,
  Testimonials,
} from "./CadenceSite";
import { DemoDock } from "./DemoDock";
import { OverlayPlacements, PlacementCallout } from "./DemoPlacements";
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import { SurveyJsonPanel } from "./SurveyJsonPanel";
import { useDemoChrome } from "./useDemoChrome";
import type { DemoSurvey } from "./demo-controls";

const ANCHOR = "feedback";

/**
 * Embedded demo #1 and #2: an ordinary product marketing site, with a survey in
 * its hero. Which survey depends on the sidebar entry that opened it — the
 * toolbar can swap between them either way.
 *
 * The page it lives on has no admin chrome by design — see `src/app/layout.tsx`
 * and the `(shell)` route group. The sidebar entries open it in a new tab for the
 * same reason, and the toolbar offers full screen from there.
 */
export function CadenceDemo({ surveys }: { surveys: readonly DemoSurvey[] }) {
  const chrome = useDemoChrome({ surveys, anchorId: ANCHOR });

  const survey = (
    <EmbeddedSurvey key={chrome.runKey} json={chrome.json} data={chrome.seed} />
  );

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <SiteHeader onFeedback={chrome.requestSurvey} />

      <main className="flex-1">
        <Hero>
          {chrome.placement === "inline" ? (
            <SurveyCard>{survey}</SurveyCard>
          ) : (
            <PlacementCallout
              placement={chrome.placement}
              title={chrome.activeSurvey.label}
              onOpen={() => chrome.setOverlayOpen(true)}
            />
          )}
        </Hero>

        <EmbedNotes />
        <AppPreview />
        <Stats />
        <Features />
        <Suite />
        <Testimonials />
        <Pricing />
        <ClosingBand onFeedback={chrome.requestSurvey} />
      </main>

      <SiteFooter />

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
