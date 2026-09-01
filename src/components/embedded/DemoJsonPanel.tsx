"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { AlertTriangleIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SurveyJSON } from "@/schemas";
import { usedVariableKeys } from "./demo-accounts";

const JsonEditor = dynamic(() => import("@/components/JsonEditor"), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Loading editor…
    </div>
  ),
});

/**
 * The survey definition, editable over the live page.
 *
 * Deliberately not a modal — the point is to type here and watch the form change
 * inside the host site, so the page behind stays scrollable and clickable the
 * whole time.
 *
 * The other half of the story lives in the toolbar's "Edit the user" popup: this
 * definition reads that account as `{user.something}`, and the line under the
 * editor names the keys it actually reads.
 *
 * Edits live in this window only — nothing is written to storage.
 */
export function DemoJsonPanel({
  open,
  onClose,
  json,
  surveySource,
  onSurveySourceChange,
  surveyError,
  surveyEdited,
  onRevertSurvey,
  account,
}: {
  open: boolean;
  onClose: () => void;
  json: SurveyJSON;
  surveySource: string;
  onSurveySourceChange: (source: string) => void;
  surveyError: string | null;
  surveyEdited: boolean;
  onRevertSurvey: () => void;
  /** The signed-in user, for the "reads these keys" line. */
  account: Record<string, unknown>;
}) {
  const { resolvedTheme } = useTheme();

  if (!open) return null;

  const wired = usedVariableKeys(json, account);
  // Long lists stop being readable; the popup shows the whole object anyway.
  const wiredShown = wired.slice(0, 10);
  const wiredRest = wired.length - wiredShown.length;

  return (
    <aside
      aria-label="Live JSON"
      className="bg-background fixed inset-y-0 right-0 z-[65] flex w-full max-w-xl flex-col border-l shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-semibold">The form is a JSON document</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            This is the definition behind the form on the page. Type, and the survey
            follows a moment later.
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close the JSON editor" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      {surveyError && (
        <p className="text-destructive flex items-start gap-2 border-b px-4 py-2 text-xs">
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
          {surveyError}
        </p>
      )}

      <div className="min-h-0 flex-1">
        <JsonEditor
          value={surveySource}
          onChange={onSurveySourceChange}
          dark={resolvedTheme === "dark"}
        />
      </div>

      <p className="text-muted-foreground border-t px-4 py-2.5 text-xs leading-relaxed">
        {wired.length > 0 ? (
          <>
            It reads{" "}
            <span className="text-foreground font-medium">{wiredShown.join(", ")}</span>
            {wiredRest > 0 ? ` and ${wiredRest} more` : ""} off the signed-in user — as{" "}
            <code className="text-[11px]">{"{user.name}"}</code> in titles, in{" "}
            <code className="text-[11px]">visibleIf</code>, and in{" "}
            <code className="text-[11px]">defaultValueExpression</code>. Change them in
            the toolbar&apos;s user popup.
          </>
        ) : (
          "It does not read anything off the signed-in user yet."
        )}
      </p>

      <div className="flex items-center justify-between gap-3 border-t p-3">
        <p className="text-muted-foreground text-xs">
          {surveyEdited ? "Edited in this window only." : "Unchanged from the template."}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onRevertSurvey}
          disabled={!surveyEdited}
        >
          <RotateCcwIcon />
          Revert
        </Button>
      </div>
    </aside>
  );
}
