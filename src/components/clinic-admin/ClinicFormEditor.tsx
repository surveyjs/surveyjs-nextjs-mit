"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { RotateCcwIcon, WandSparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmbeddedSurvey, SurveyCard } from "@/components/embedded/EmbeddedSurvey";
import { StaticAnalysisBar, type LintMarker } from "@/components/lint/StaticAnalysisBar";
import type { JsonEditorApi } from "@/components/JsonEditor";
import { RIDGELINE_USER } from "@/components/embedded/demo-accounts";
import { loadSurveyJson, resetSurveyJson, saveSurveyJson } from "@/storage/survey-json";
import { loadDemoUsers } from "@/storage/demo-users";
import { CLINIC_PATIENTS, type SurveyData, type SurveyJSON } from "@/schemas";

const JsonEditor = dynamic(() => import("@/components/JsonEditor"), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Loading editor…
    </div>
  ),
});

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * The one variable the appointment form is rendered for.
 *
 * The linter reads the JSON and nothing else, so `{user.preferredName}` looks
 * like a reference to a question that does not exist — dozens of findings on a
 * form that works exactly as designed. Naming it here is the same declaration
 * the website makes at runtime with `setVariable("user", patient)`.
 */
const RUNTIME_VARIABLES = ["user"] as const;

function parse(source: string): { json?: SurveyJSON; error?: string } {
  try {
    const parsed = JSON.parse(source);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { error: "The survey definition must be a JSON object." };
    }
    return { json: parsed as SurveyJSON };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/**
 * The appointment form, as the practice maintains it.
 *
 * The whole form is the document on the left — no form builder, no code deploy —
 * and the column on the right is what a patient will get, following it as you
 * type. It is rendered for the first patient in the chart list, because this form
 * is never rendered for nobody: that is what makes the greeting, the pre-answered
 * fields and the questions built out of a problem list possible.
 *
 * There is nothing to press: a valid document is saved as it is typed, so the
 * Preview button in the corner always opens the website on this version of the
 * form — the same definition, now inside the clinic's public page, where the
 * survey stops being a preview and starts being an embed.
 */
export function ClinicFormEditor({
  formId,
  defaultSource,
}: {
  formId: string;
  /** The canonical definition, server-rendered, and what Reset restores. */
  defaultSource: string;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [source, setSource] = useState(defaultSource);
  const [preview, setPreview] = useState(defaultSource);
  const [customized, setCustomized] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // The definition this browser saved, if any, so staff never land on a version
  // they have already replaced.
  useEffect(() => {
    let active = true;
    void loadSurveyJson(formId).then((stored) => {
      if (!active || !stored) return;
      const loaded = JSON.stringify(stored, null, 2);
      setSource(loaded);
      setPreview(loaded);
      setCustomized(true);
    });
    return () => {
      active = false;
    };
  }, [formId]);

  useEffect(() => {
    const timer = setTimeout(() => setPreview(source), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [source]);

  // Whoever is first in the chart list: the preview has to be rendered for
  // somebody, and the website's own picker is where switching belongs.
  const [patient, setPatient] = useState<SurveyData>(CLINIC_PATIENTS[0].data);
  useEffect(() => {
    let active = true;
    void loadDemoUsers(formId).then((stored) => {
      if (!active || !stored) return;
      setPatient(stored[0].data);
    });
    return () => {
      active = false;
    };
  }, [formId]);

  const variables = useMemo(
    () => ({ user: RIDGELINE_USER.toAccount(patient) }),
    [patient],
  );

  // Parsed once and shared: the banner, Format and the linter all read this.
  const parsedSource = useMemo(() => parse(source), [source]);
  const parsedPreview = useMemo(() => parse(preview), [preview]);
  const syntaxError = parsedSource.error;

  const [markers, setMarkers] = useState<readonly LintMarker[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const editorApi = useRef<JsonEditorApi | null>(null);

  const selectedLine = useMemo(
    () => markers.find((marker) => marker.path === selectedPath)?.line ?? null,
    [markers, selectedPath],
  );

  const applyJson = useCallback((json: Record<string, unknown>) => {
    setSource(JSON.stringify(json, null, 2));
    setSelectedPath(null);
  }, []);

  const revealLine = useCallback((line: number) => {
    editorApi.current?.revealLine(line);
  }, []);

  const format = useCallback(() => {
    const { json } = parsedSource;
    if (json) setSource(JSON.stringify(json, null, 2));
  }, [parsedSource]);

  // Saved on the same beat as the preview: every valid document goes straight
  // to storage, so the website is never a version behind the editor. A broken
  // one is simply not written — the banner above already says why.
  useEffect(() => {
    const json = parsedPreview.json;
    if (!json || preview === defaultSource) return;
    let active = true;
    void saveSurveyJson(formId, json)
      .then(() => {
        if (!active) return;
        setCustomized(true);
        setStorageError(null);
      })
      .catch((failure: Error) => {
        if (active) setStorageError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [defaultSource, formId, parsedPreview.json, preview]);

  const reset = useCallback(async () => {
    await resetSurveyJson(formId);
    setSource(defaultSource);
    setCustomized(false);
    setStorageError(null);
    // Also drops whatever a "Try breaking it" action injected: those only ever
    // write to `source`, which this restores.
    setSelectedPath(null);
  }, [defaultSource, formId]);

  return (
    <>
      <div className="mb-3">
        <h1 className="text-lg font-semibold tracking-tight">Appointment Form</h1>
        <p className="text-muted-foreground mt-0.5 max-w-[50%] text-sm">
          To change the Appointment Form edit the JSON below.
        </p>
      </div>

      {(syntaxError || storageError) && (
        <div className="border-destructive/50 text-destructive mb-3 rounded-md border px-3 py-2 text-sm">
          {storageError ?? syntaxError}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="bg-background flex min-h-[26rem] min-w-0 flex-col overflow-hidden rounded-lg border">
          {/* Format and Reset act on the document in this pane, so they live on
              it rather than in the page header. */}
          <div className="flex items-center justify-between gap-2 border-b px-3 py-1.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Survey JSON
            </span>
            <span className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={format}
                disabled={Boolean(syntaxError)}
              >
                <WandSparklesIcon />
                Format
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={reset}
                disabled={source === defaultSource && !customized}
              >
                <RotateCcwIcon />
                Reset
              </Button>
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <JsonEditor
              value={source}
              onChange={setSource}
              dark={resolvedTheme === "dark"}
              markers={markers}
              highlightLine={selectedLine}
              onReady={(api) => {
                editorApi.current = api;
              }}
              onMarkerActivate={setSelectedPath}
            />
          </div>
          <StaticAnalysisBar
            text={source}
            json={parsedSource.json ?? null}
            onRevealLine={revealLine}
            onMarkersChange={setMarkers}
            onApplyJson={applyJson}
            selectedPath={selectedPath}
            onSelectPath={setSelectedPath}
            knownVariables={RUNTIME_VARIABLES}
          />
        </div>

        {/* No heading: this column is the form, and naming it would only invite
            the question of what makes it different from the real one. */}
        <div className="min-h-0 min-w-0 overflow-y-auto">
          {mounted && parsedPreview.json ? (
            <SurveyCard>
              <EmbeddedSurvey
                key={preview}
                json={parsedPreview.json}
                variables={variables}
              />
            </SurveyCard>
          ) : (
            <div className="text-muted-foreground bg-background rounded-lg border p-6 text-sm">
              {parsedPreview.error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
