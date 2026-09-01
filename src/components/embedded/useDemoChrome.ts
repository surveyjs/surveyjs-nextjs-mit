"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SurveyData, SurveyJSON } from "@/schemas";
import { DEFAULT_BRAND_ID, applyBrand, getBrand, type DemoSurvey } from "./demo-controls";

/**
 * Everything the embedded demos have in common, minus the page itself.
 *
 * Each demo is one host site with one form sitting inline in it, in its own brand
 * colour. What a reviewer can change is deliberately narrow, and it is the whole
 * argument:
 *
 *  1. **the definition** — the form is JSON, and editing the JSON changes the
 *     form on the page while you type;
 *  2. **the user** — the account is a JSON document in the same panel, and
 *     editing it moves values *and* structure, because the definition reads it
 *     as `{user.something}`.
 *
 * Prefill and Reset are there so the pair can be demonstrated on a full form
 * without typing twelve answers first, and "Highlight SurveyJS Render" answers
 * the question every reviewer asks about an embedded demo: which part of this page
 * is actually the form?
 */
export interface DemoChrome {
  readonly survey: DemoSurvey;
  /** The definition to render: the shipped one, or whatever the editor holds. */
  readonly json: SurveyJSON;
  /** Answers to load. `undefined` means start empty. */
  readonly seed: SurveyData | undefined;
  /**
   * What the host app knows about the visitor, ready for `setVariable`.
   *
   * One variable, `user`, holding the whole account — so the definition reads
   * `{user.firstName}` and can never collide with a question of the same name
   * (the clinic form has questions called `firstName` and `email`).
   */
  readonly variables: Record<string, unknown>;
  /** The same object, for the host page's own header and copy. */
  readonly account: Record<string, unknown>;
  /** Changes whenever the survey has to be rebuilt from scratch. */
  readonly runKey: string;
  /** Scrolls the page to the form. */
  readonly requestSurvey: () => void;
  /** Rebuild the survey carrying these answers over — "change my answers". */
  readonly resumeWith: (data: SurveyData) => void;
  readonly dockProps: {
    highlight: boolean;
    onToggleHighlight: () => void;
    onPrefill: () => void;
    onReset: () => void;
    onEditJson: () => void;
    edited: boolean;
    panelOpen: boolean;
    align: "center" | "left";
  };
  readonly panelProps: {
    open: boolean;
    onClose: () => void;
    json: SurveyJSON;
    surveySource: string;
    onSurveySourceChange: (source: string) => void;
    surveyError: string | null;
    surveyEdited: boolean;
    onRevertSurvey: () => void;
    accountSource: string;
    onAccountSourceChange: (source: string) => void;
    accountError: string | null;
    accountEdited: boolean;
    onRevertAccount: () => void;
    account: Record<string, unknown>;
  };
}

const DEBOUNCE_MS = 400;

/** Parses an editor's text, rejecting anything that is not a JSON object. */
function parseObject(source: string): { value: Record<string, unknown> } | { error: string } {
  try {
    const parsed = JSON.parse(source);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { error: "This has to be a JSON object." };
    }
    return { value: parsed as Record<string, unknown> };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function useDemoChrome({
  survey,
  account: preset,
  /** Element the form lives in, so the demo can scroll back to it. */
  anchorId,
  brandId = DEFAULT_BRAND_ID,
}: {
  survey: DemoSurvey;
  /** What the host app knows about the visitor. Editable live in the panel. */
  account: Readonly<Record<string, unknown>>;
  anchorId: string;
  /** Palette the demo runs in, so no two host sites look alike. */
  brandId?: string;
}): DemoChrome {
  // A fresh seed object remounts the survey model, which is what Prefill and
  // Reset want; `runCount` covers resetting when there was nothing to clear.
  const [seed, setSeed] = useState<SurveyData | undefined>(undefined);
  const [runCount, setRunCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    applyBrand(getBrand(brandId));
  }, [brandId]);

  // The demo owns the palette only while it is on screen.
  useEffect(() => () => applyBrand(getBrand("neutral")), []);

  // One attribute on <html>; the outline itself is in `globals.css`, keyed off
  // the `data-survey-root` marker that `SurveyCard` carries.
  useEffect(() => {
    const root = document.documentElement;
    if (highlight) root.setAttribute("data-demo-highlight", "");
    else root.removeAttribute("data-demo-highlight");
    return () => root.removeAttribute("data-demo-highlight");
  }, [highlight]);

  /* ── the definition ──────────────────────────────────────────────────────── */

  const defaultSurveySource = useMemo(() => JSON.stringify(survey.json, null, 2), [survey.json]);
  const [surveySource, setSurveySource] = useState(defaultSurveySource);
  const [json, setJson] = useState<SurveyJSON>(survey.json);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const surveyEdited = surveySource !== defaultSurveySource;

  // The text that produced the definition now on screen. Without it the effect
  // below re-parses on every mount and hands the survey a brand new — but
  // identical — object, which rebuilds the model and throws the visitor back to
  // page one 400ms after they started.
  const appliedSurvey = useRef(defaultSurveySource);

  // Debounced so the survey is rebuilt once a typing pause, not once a keystroke.
  useEffect(() => {
    if (surveySource === appliedSurvey.current) return;
    const timer = setTimeout(() => {
      const result = parseObject(surveySource);
      if ("error" in result) {
        setSurveyError(result.error);
        return;
      }
      appliedSurvey.current = surveySource;
      setJson(result.value as SurveyJSON);
      setSurveyError(null);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [surveySource]);

  /* ── the user the definition is rendered for ─────────────────────────────── */

  const defaultAccountSource = useMemo(() => JSON.stringify(preset, null, 2), [preset]);
  const [accountSource, setAccountSource] = useState(defaultAccountSource);
  const [account, setAccount] = useState<Record<string, unknown>>(() => ({ ...preset }));
  const [accountError, setAccountError] = useState<string | null>(null);
  const accountEdited = accountSource !== defaultAccountSource;

  const appliedAccount = useRef(defaultAccountSource);

  useEffect(() => {
    if (accountSource === appliedAccount.current) return;
    const timer = setTimeout(() => {
      const result = parseObject(accountSource);
      if ("error" in result) {
        setAccountError(result.error);
        return;
      }
      appliedAccount.current = accountSource;
      setAccount(result.value);
      setAccountError(null);
      // A different user is a different form, so the model is rebuilt rather
      // than re-fed — `runKey` remounts it.
      setRunCount((count) => count + 1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [accountSource]);

  /* ── actions ─────────────────────────────────────────────────────────────── */

  const revealAnchor = useCallback(() => {
    requestAnimationFrame(() =>
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" }),
    );
  }, [anchorId]);

  // Turning the outline on also brings the form into view: on these pages the
  // survey can easily be below the fold, and an outline nobody can see proves
  // nothing.
  const toggleHighlight = useCallback(() => {
    if (!highlight) revealAnchor();
    setHighlight((on) => !on);
  }, [highlight, revealAnchor]);

  const restart = useCallback(() => {
    setSeed(undefined);
    setRunCount((count) => count + 1);
  }, []);

  const prefill = useCallback(() => {
    setSeed({ ...survey.prefill });
    setRunCount((count) => count + 1);
  }, [survey.prefill]);

  const resumeWith = useCallback(
    (data: SurveyData) => {
      setSeed({ ...data });
      setRunCount((count) => count + 1);
      revealAnchor();
    },
    [revealAnchor],
  );

  const revertSurvey = useCallback(() => {
    setSurveySource(defaultSurveySource);
    appliedSurvey.current = defaultSurveySource;
    setJson(survey.json);
    setSurveyError(null);
    restart();
  }, [defaultSurveySource, survey.json, restart]);

  const revertAccount = useCallback(() => {
    setAccountSource(defaultAccountSource);
    appliedAccount.current = defaultAccountSource;
    setAccount({ ...preset });
    setAccountError(null);
    setRunCount((count) => count + 1);
  }, [defaultAccountSource, preset]);

  const variables = useMemo(() => ({ user: account }), [account]);

  return {
    survey,
    json,
    seed,
    variables,
    account,
    runKey: `${survey.id}-${runCount}`,
    requestSurvey: revealAnchor,
    resumeWith,
    dockProps: {
      highlight,
      onToggleHighlight: toggleHighlight,
      onPrefill: prefill,
      onReset: restart,
      onEditJson: () => setPanelOpen((open) => !open),
      edited: surveyEdited || accountEdited,
      panelOpen,
      align: panelOpen ? "left" : "center",
    },
    panelProps: {
      open: panelOpen,
      onClose: () => setPanelOpen(false),
      json,
      surveySource,
      onSurveySourceChange: setSurveySource,
      surveyError,
      surveyEdited,
      onRevertSurvey: revertSurvey,
      accountSource,
      onAccountSourceChange: setAccountSource,
      accountError,
      accountEdited,
      onRevertAccount: revertAccount,
      account,
    },
  };
}
