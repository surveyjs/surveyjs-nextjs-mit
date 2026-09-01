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
 * Two documents, side by side over the live page: the form, and the person the
 * form is being rendered for.
 *
 * Deliberately not a modal — the point is to type here and watch the survey
 * change inside the host site, so the page behind stays scrollable and clickable
 * the whole time.
 *
 * Reading it top to bottom is the pitch in order. The user object is what an app
 * already has after a session lookup; the definition below refers to it as
 * `{user.something}`; the form on the page is the result. Change `"firstName"`
 * and the greeting changes. Change `"isNewPatient"` and whole pages appear.
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
  accountSource,
  onAccountSourceChange,
  accountError,
  accountEdited,
  onRevertAccount,
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
  accountSource: string;
  onAccountSourceChange: (source: string) => void;
  accountError: string | null;
  accountEdited: boolean;
  onRevertAccount: () => void;
  account: Record<string, unknown>;
}) {
  const { resolvedTheme } = useTheme();

  if (!open) return null;

  const dark = resolvedTheme === "dark";
  const wired = usedVariableKeys(json, account);
  // Long lists stop being readable; the editor above is the full picture anyway.
  const wiredShown = wired.slice(0, 10);
  const wiredRest = wired.length - wiredShown.length;

  return (
    <aside
      aria-label="Live JSON"
      className="bg-background fixed inset-y-0 right-0 z-[65] flex w-full max-w-xl flex-col border-l shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-semibold">Everything here is JSON</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            The user on top, the form below. Type in either one and the page follows a
            moment later.
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close the JSON editors" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      {/* ── the user ── */}
      <section aria-label="The signed-in user" className="flex flex-col border-b">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <p className="text-[13px] font-semibold">The signed-in user</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={onRevertAccount}
            disabled={!accountEdited}
          >
            <RotateCcwIcon className="size-3" />
            Revert
          </Button>
        </div>

        {accountError && (
          <p className="text-destructive flex items-start gap-2 px-4 pt-2 text-xs">
            <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
            {accountError}
          </p>
        )}

        <div className="mt-2 h-72 border-y">
          <JsonEditor value={accountSource} onChange={onAccountSourceChange} dark={dark} />
        </div>

        <p className="text-muted-foreground px-4 py-2 text-xs leading-relaxed">
          {wired.length > 0 ? (
            <>
              The definition below reads{" "}
              <span className="text-foreground font-medium">{wiredShown.join(", ")}</span>
              {wiredRest > 0 ? ` and ${wiredRest} more` : ""} — as{" "}
              <code className="text-[11px]">{"{user.name}"}</code> in titles, in{" "}
              <code className="text-[11px]">visibleIf</code>, and in{" "}
              <code className="text-[11px]">defaultValueExpression</code>.
            </>
          ) : (
            "The definition below does not read any of these keys yet."
          )}
        </p>
      </section>

      {/* ── the form ── */}
      <section aria-label="The survey definition" className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-[13px] font-semibold">The survey definition</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs"
            onClick={onRevertSurvey}
            disabled={!surveyEdited}
          >
            <RotateCcwIcon className="size-3" />
            Revert
          </Button>
        </div>

        {surveyError && (
          <p className="text-destructive flex items-start gap-2 border-t px-4 py-2 text-xs">
            <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
            {surveyError}
          </p>
        )}

        <div className="min-h-0 flex-1 border-t">
          <JsonEditor value={surveySource} onChange={onSurveySourceChange} dark={dark} />
        </div>
      </section>

      <p className="text-muted-foreground border-t px-4 py-2.5 text-xs">
        {surveyEdited || accountEdited
          ? "Edited in this window only — nothing is saved."
          : "Unchanged from the template."}
      </p>
    </aside>
  );
}
