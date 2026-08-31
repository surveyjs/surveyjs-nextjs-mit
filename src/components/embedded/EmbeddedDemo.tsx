"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRightIcon, MessageCircleIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SurveyData, SurveyJSON } from "@/schemas";
import { cn } from "@/lib/utils";
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
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import { SurveyJsonPanel } from "./SurveyJsonPanel";
import {
  DEFAULT_BRAND_ID,
  applyBrand,
  getBrand,
  type DemoSurvey,
  type PlacementId,
} from "./demo-controls";

/**
 * The overlay placements are Radix dialogs opened with `modal={false}`, so the
 * demo toolbar stays clickable over them — a reviewer can switch placement or
 * recolour the brand without closing the survey first. The trade is that Radix
 * treats a click on the toolbar as an outside interaction, hence this guard.
 */
function keepOpenForDock(event: Event) {
  if ((event.target as HTMLElement | null)?.closest("[data-demo-dock]")) {
    event.preventDefault();
  }
}

/**
 * The embedded demo: a couple of survey definitions, four ways a real site would
 * host them, and a quiet toolbar for switching between both axes.
 *
 * The page it lives on has no admin chrome by design — see `src/app/layout.tsx`
 * and the `(shell)` route group. The sidebar entry opens it in a new tab for the
 * same reason, and the toolbar offers full screen from there.
 */
export function EmbeddedDemo({ surveys }: { surveys: readonly DemoSurvey[] }) {
  const [surveyId, setSurveyId] = useState(surveys[0].id);
  const [placement, setPlacement] = useState<PlacementId>("inline");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [brandId, setBrandId] = useState(DEFAULT_BRAND_ID);

  const activeSurvey =
    surveys.find((survey) => survey.id === surveyId) ?? surveys[0];

  // A fresh object remounts the survey model, which is exactly what Prefill and
  // Reset want; `runKey` covers resetting when there was nothing to clear.
  const [seed, setSeed] = useState<SurveyData | undefined>(undefined);
  const [runKey, setRunKey] = useState(0);

  const defaultSource = useMemo(
    () => JSON.stringify(activeSurvey.json, null, 2),
    [activeSurvey.json],
  );
  const [source, setSource] = useState(defaultSource);
  const [json, setJson] = useState<SurveyJSON>(activeSurvey.json);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonPanelOpen, setJsonPanelOpen] = useState(false);
  const jsonEdited = source !== defaultSource;

  useEffect(() => {
    applyBrand(getBrand(brandId));
  }, [brandId]);

  // The demo owns the palette only while it is on screen.
  useEffect(() => () => applyBrand(getBrand("neutral")), []);

  // The text that produced the definition now on screen. Without it this effect
  // re-parses on every mount and hands the survey a brand new — but identical —
  // object, which rebuilds the model and throws the visitor back to page one
  // 400ms after they started.
  const appliedSource = useRef(defaultSource);

  // Debounced so the survey is rebuilt once a typing pause, not once a keystroke.
  useEffect(() => {
    if (source === appliedSource.current) return;
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(source);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          setJsonError("The survey definition must be a JSON object.");
          return;
        }
        appliedSource.current = source;
        setJson(parsed as SurveyJSON);
        setJsonError(null);
      } catch (error) {
        setJsonError((error as Error).message);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [source]);

  const restart = useCallback(() => {
    setSeed(undefined);
    setRunKey((key) => key + 1);
  }, []);

  const prefill = useCallback(() => {
    setSeed({ ...activeSurvey.prefill });
    setRunKey((key) => key + 1);
  }, [activeSurvey.prefill]);

  // Both switchers bring the form back into view: a few steps in, the card has
  // grown or shrunk and the reviewer is rarely still looking straight at it.
  const revealInlineSurvey = useCallback(() => {
    requestAnimationFrame(() =>
      document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" }),
    );
  }, []);

  // Swapping the definition resets everything derived from it, so an edited JSON
  // or a half-filled run never leaks into the other survey.
  const changeSurvey = useCallback(
    (nextId: string) => {
      const next = surveys.find((survey) => survey.id === nextId) ?? surveys[0];
      const nextSource = JSON.stringify(next.json, null, 2);
      setSurveyId(next.id);
      setSource(nextSource);
      appliedSource.current = nextSource;
      setJson(next.json);
      setJsonError(null);
      setSeed(undefined);
      setRunKey((key) => key + 1);
      if (placement === "inline") revealInlineSurvey();
    },
    [surveys, placement, revealInlineSurvey],
  );

  const changePlacement = useCallback(
    (next: PlacementId) => {
      setPlacement(next);
      // Switching should show the result straight away, not leave the reviewer
      // hunting for a trigger.
      setOverlayOpen(next !== "inline");
      if (next === "inline") revealInlineSurvey();
    },
    [revealInlineSurvey],
  );

  const requestSurvey = useCallback(() => {
    if (placement === "inline") {
      revealInlineSurvey();
      return;
    }
    setOverlayOpen(true);
  }, [placement, revealInlineSurvey]);

  const survey = (
    <EmbeddedSurvey key={`${surveyId}-${runKey}`} json={json} data={seed} />
  );

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <SiteHeader onFeedback={requestSurvey} />

      <main className="flex-1">
        <Hero>
          {placement === "inline" ? (
            <SurveyCard>{survey}</SurveyCard>
          ) : (
            <PlacementCallout placement={placement} onOpen={() => setOverlayOpen(true)} />
          )}
        </Hero>

        <EmbedNotes />
        <AppPreview />
        <Stats />
        <Features />
        <Suite />
        <Testimonials />
        <Pricing />
        <ClosingBand onFeedback={requestSurvey} />
      </main>

      <SiteFooter />

      {/* Radix drops its own overlay when `modal` is false, so the scrim is ours.
          It sits under the dialog and under the toolbar, and closes on click. */}
      {overlayOpen && (placement === "modal" || placement === "drawer") && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOverlayOpen(false)}
          aria-hidden
        />
      )}

      {placement === "modal" && (
        <Dialog open={overlayOpen} onOpenChange={setOverlayOpen} modal={false}>
          <DialogContent
            className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
            onInteractOutside={keepOpenForDock}
          >
            {/* The survey carries its own title and description, so the dialog's
                are for assistive tech only — two headings would read as a seam. */}
            <DialogHeader className="sr-only">
              <DialogTitle>{activeSurvey.label}</DialogTitle>
              <DialogDescription>
                A short form. You can close this at any point.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{survey}</div>
          </DialogContent>
        </Dialog>
      )}

      {placement === "drawer" && (
        <Sheet open={overlayOpen} onOpenChange={setOverlayOpen} modal={false}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 sm:max-w-2xl"
            onInteractOutside={keepOpenForDock}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{activeSurvey.label}</SheetTitle>
              <SheetDescription>
                A short form. The page stays where you left it.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{survey}</div>
          </SheetContent>
        </Sheet>
      )}

      {placement === "bubble" && (
        <>
          {overlayOpen && (
            <div className="bg-card fixed right-6 bottom-24 z-40 flex max-h-[74vh] w-[28rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border shadow-2xl">
              <div className="flex justify-end border-b px-2 py-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close the feedback widget"
                  onClick={() => setOverlayOpen(false)}
                >
                  <XIcon />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{survey}</div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOverlayOpen((open) => !open)}
            aria-expanded={overlayOpen}
            className={cn(
              "demo-brand-bg text-primary-foreground fixed right-6 bottom-6 z-40 flex size-14 items-center justify-center rounded-full shadow-xl transition-transform",
              "hover:scale-105 focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
            )}
          >
            {overlayOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MessageCircleIcon className="size-5" />
            )}
            <span className="sr-only">
              {overlayOpen ? "Close the feedback widget" : "Open the feedback widget"}
            </span>
          </button>
        </>
      )}

      <SurveyJsonPanel
        open={jsonPanelOpen}
        onClose={() => setJsonPanelOpen(false)}
        source={source}
        onSourceChange={setSource}
        onRevert={() => {
          setSource(defaultSource);
          restart();
        }}
        error={jsonError}
        edited={jsonEdited}
      />

      <DemoDock
        surveys={surveys}
        surveyId={surveyId}
        onSurveyChange={changeSurvey}
        placement={placement}
        onPlacementChange={changePlacement}
        brandId={brandId}
        onBrandChange={setBrandId}
        onPrefill={prefill}
        onReset={restart}
        onEditJson={() => setJsonPanelOpen((open) => !open)}
        jsonEdited={jsonEdited}
        align={jsonPanelOpen ? "left" : "center"}
      />
    </div>
  );
}

const CALLOUT_COPY: Record<Exclude<PlacementId, "inline">, string> = {
  modal: "The same form, centred over the page in a dialog.",
  drawer: "The same form, sliding in from the edge while the page stays put.",
  bubble: "The same form, behind the launcher in the bottom-right corner.",
};

/** What the section shows when the survey has moved into an overlay. */
function PlacementCallout({
  placement,
  onOpen,
}: {
  placement: Exclude<PlacementId, "inline">;
  onOpen: () => void;
}) {
  return (
    <SurveyCard className="flex flex-col items-start gap-4 p-8">
      <span className="demo-brand-soft flex size-10 items-center justify-center rounded-lg">
        <MessageCircleIcon className="size-5" />
      </span>
      <div>
        <p className="text-lg font-medium">Find the right plan</p>
        <p className="text-muted-foreground mt-1 text-sm">{CALLOUT_COPY[placement]}</p>
      </div>
      <Button className="demo-brand-bg gap-2 hover:opacity-90" onClick={onOpen}>
        Open the form
        <ArrowRightIcon />
      </Button>
    </SurveyCard>
  );
}
