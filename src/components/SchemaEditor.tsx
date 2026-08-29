"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  ArrowLeftIcon,
  RotateCcwIcon,
  SaveIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurveyForm } from "@/components/SurveyForm";
import {
  StaticAnalysisBar,
  type LintMarker,
} from "@/components/lint/StaticAnalysisBar";
import type { JsonEditorApi } from "@/components/JsonEditor";
import {
  loadSurveyJson,
  resetSurveyJson,
  saveSurveyJson,
} from "@/storage/survey-json";
import type { SurveyJSON } from "@/schemas";

const JsonEditor = dynamic(() => import("@/components/JsonEditor"), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Loading editor…
    </div>
  ),
});

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

export function SchemaEditor({
  schemaId,
  title,
  backHref,
  defaultSource,
}: {
  schemaId: string;
  title: string;
  backHref: string;
  /** The canonical definition, server-rendered and used by "Reset". */
  defaultSource: string;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [source, setSource] = useState(defaultSource);
  const [preview, setPreview] = useState(defaultSource);
  const [customized, setCustomized] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load this browser's saved definition, so the editor does not sit on the
  // canonical JSON for someone who has their own.
  useEffect(() => {
    let active = true;
    void loadSurveyJson(schemaId).then((saved) => {
      if (!active || !saved) return;
      const loaded = JSON.stringify(saved, null, 2);
      setSource(loaded);
      setPreview(loaded);
      setCustomized(true);
    });
    return () => {
      active = false;
    };
  }, [schemaId]);

  useEffect(() => {
    const timer = setTimeout(() => setPreview(source), 400);
    return () => clearTimeout(timer);
  }, [source]);

  const parsedPreview = useMemo(() => parse(preview), [preview]);
  // Parsed once and shared: the syntax banner, "Format" and the linter all read
  // this, so the document is never parsed twice for one keystroke.
  const parsedSource = useMemo(() => parse(source), [source]);
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

  const save = useCallback(async () => {
    const { json, error } = parse(source);
    if (!json) {
      setStorageError(error ?? "Invalid JSON.");
      return;
    }
    try {
      await saveSurveyJson(schemaId, json);
    } catch (failure) {
      setStorageError((failure as Error).message);
      return;
    }
    setStorageError(null);
    router.push(backHref);
  }, [backHref, router, schemaId, source]);

  const reset = useCallback(async () => {
    await resetSurveyJson(schemaId);
    setSource(defaultSource);
    setCustomized(false);
    setStorageError(null);
    // Also drops whatever a "Try breaking it" action injected: those only ever
    // write to `source`, which this restores.
    setSelectedPath(null);
  }, [defaultSource, schemaId]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {title} — survey JSON
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            The whole form is this JSON. Edit it, watch the preview update, then
            save — your version is kept in this browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.push(backHref)}
          >
            <ArrowLeftIcon />
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={format}
            disabled={Boolean(syntaxError)}
          >
            <WandSparklesIcon />
            Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={reset}
            disabled={source === defaultSource && !customized}
          >
            <RotateCcwIcon />
            Reset
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={save}
            disabled={Boolean(syntaxError)}
          >
            <SaveIcon />
            Save and quit
          </Button>
        </div>
      </div>

      {(syntaxError || storageError) && (
        <div className="border-destructive/50 text-destructive mb-3 rounded-md border px-3 py-2 text-sm">
          {storageError ?? syntaxError}
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-[24rem] min-w-0 flex-col overflow-hidden rounded-lg border">
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
          />
        </div>

        <div className="min-h-0 overflow-y-auto">
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Live preview
          </p>
          {parsedPreview.json ? (
            <SurveyForm key={preview} schema={parsedPreview.json} />
          ) : (
            <div className="text-muted-foreground border p-6 text-sm">
              {parsedPreview.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
