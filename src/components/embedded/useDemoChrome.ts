"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SurveyData, SurveyJSON } from "@/schemas";
import {
  DEFAULT_BRAND_ID,
  applyBrand,
  getBrand,
  type DemoSurvey,
  type PlacementId,
} from "./demo-controls";

/**
 * Everything the embedded demos have in common, minus the page itself.
 *
 * Both demos offer the same reviewer controls — swap the definition, move it
 * between four placements, prefill it, edit its JSON live, recolour the host
 * brand — and none of that is about the site being imitated. It lives here so
 * the two demos cannot drift apart, and so a page component is left with only
 * its own job.
 */
export interface DemoChrome {
  readonly activeSurvey: DemoSurvey;
  readonly placement: PlacementId;
  readonly overlayOpen: boolean;
  readonly setOverlayOpen: (open: boolean) => void;
  /** The definition to render: the shipped one, or whatever the editor holds. */
  readonly json: SurveyJSON;
  /** Answers to load. `undefined` means start empty. */
  readonly seed: SurveyData | undefined;
  /** Changes whenever the survey has to be rebuilt from scratch. */
  readonly runKey: string;
  /** Scrolls to the inline survey, or opens the overlay holding it. */
  readonly requestSurvey: () => void;
  /** Rebuild the survey carrying these answers over — "change my answers". */
  readonly resumeWith: (data: SurveyData) => void;
  /** Switch to another definition — the demos use it to change page. */
  readonly selectSurvey: (surveyId: string) => void;
  readonly dockProps: {
    surveys: readonly DemoSurvey[];
    surveyId: string;
    onSurveyChange: (surveyId: string) => void;
    placement: PlacementId;
    onPlacementChange: (placement: PlacementId) => void;
    brandId: string;
    onBrandChange: (brandId: string) => void;
    onPrefill: () => void;
    onReset: () => void;
    onEditJson: () => void;
    jsonEdited: boolean;
    align: "center" | "left";
  };
  readonly jsonPanelProps: {
    open: boolean;
    onClose: () => void;
    source: string;
    onSourceChange: (source: string) => void;
    onRevert: () => void;
    error: string | null;
    edited: boolean;
  };
}

export function useDemoChrome({
  surveys,
  /** Element the inline placement lives in, so the demo can scroll back to it. */
  anchorId,
  brandId: initialBrandId = DEFAULT_BRAND_ID,
}: {
  surveys: readonly DemoSurvey[];
  anchorId: string;
  /** Palette the demo opens in, so each host site can have its own. */
  brandId?: string;
}): DemoChrome {
  const [surveyId, setSurveyId] = useState(surveys[0].id);
  const [placement, setPlacement] = useState<PlacementId>("inline");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [brandId, setBrandId] = useState(initialBrandId);

  const activeSurvey = surveys.find((survey) => survey.id === surveyId) ?? surveys[0];

  // A fresh seed object remounts the survey model, which is what Prefill and
  // Reset want; `runCount` covers resetting when there was nothing to clear.
  const [seed, setSeed] = useState<SurveyData | undefined>(undefined);
  const [runCount, setRunCount] = useState(0);

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

  // The text that produced the definition now on screen. Without it the effect
  // below re-parses on every mount and hands the survey a brand new — but
  // identical — object, which rebuilds the model and throws the visitor back to
  // page one 400ms after they started.
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

  const revealAnchor = useCallback(() => {
    requestAnimationFrame(() =>
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" }),
    );
  }, [anchorId]);

  const restart = useCallback(() => {
    setSeed(undefined);
    setRunCount((count) => count + 1);
  }, []);

  const prefill = useCallback(() => {
    setSeed({ ...activeSurvey.prefill });
    setRunCount((count) => count + 1);
  }, [activeSurvey.prefill]);

  const resumeWith = useCallback(
    (data: SurveyData) => {
      setSeed({ ...data });
      setRunCount((count) => count + 1);
      if (placement === "inline") revealAnchor();
      else setOverlayOpen(true);
    },
    [placement, revealAnchor],
  );

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
      setRunCount((count) => count + 1);
      if (placement === "inline") revealAnchor();
    },
    [surveys, placement, revealAnchor],
  );

  const changePlacement = useCallback(
    (next: PlacementId) => {
      setPlacement(next);
      // Switching should show the result straight away, not leave the reviewer
      // hunting for a trigger.
      setOverlayOpen(next !== "inline");
      if (next === "inline") revealAnchor();
    },
    [revealAnchor],
  );

  const requestSurvey = useCallback(() => {
    if (placement === "inline") {
      revealAnchor();
      return;
    }
    setOverlayOpen(true);
  }, [placement, revealAnchor]);

  const revert = useCallback(() => {
    setSource(defaultSource);
    appliedSource.current = defaultSource;
    setJson(activeSurvey.json);
    setJsonError(null);
    restart();
  }, [defaultSource, activeSurvey.json, restart]);

  return {
    activeSurvey,
    placement,
    overlayOpen,
    setOverlayOpen,
    json,
    seed,
    runKey: `${surveyId}-${runCount}`,
    requestSurvey,
    resumeWith,
    selectSurvey: changeSurvey,
    dockProps: {
      surveys,
      surveyId,
      onSurveyChange: changeSurvey,
      placement,
      onPlacementChange: changePlacement,
      brandId,
      onBrandChange: setBrandId,
      onPrefill: prefill,
      onReset: restart,
      onEditJson: () => setJsonPanelOpen((open) => !open),
      jsonEdited,
      align: jsonPanelOpen ? "left" : "center",
    },
    jsonPanelProps: {
      open: jsonPanelOpen,
      onClose: () => setJsonPanelOpen(false),
      source,
      onSourceChange: setSource,
      onRevert: revert,
      error: jsonError,
      edited: jsonEdited,
    },
  };
}
