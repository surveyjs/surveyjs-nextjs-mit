"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { AlertTriangleIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
 * Same Monaco wrapper the `/configure` pages use, but deliberately not a modal:
 * the point is to type here and watch the form change inside the host site, so
 * the page behind it stays scrollable and clickable the whole time.
 *
 * Edits live in this window only — nothing is written to storage.
 */
export function SurveyJsonPanel({
  open,
  onClose,
  source,
  onSourceChange,
  onRevert,
  error,
  edited,
}: {
  open: boolean;
  onClose: () => void;
  source: string;
  onSourceChange: (source: string) => void;
  onRevert: () => void;
  error: string | null;
  edited: boolean;
}) {
  const { resolvedTheme } = useTheme();

  if (!open) return null;

  return (
    <aside
      aria-label="Survey JSON"
      className="bg-background fixed inset-y-0 right-0 z-[65] flex w-full max-w-xl flex-col border-l shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b p-4">
        <div>
          <p className="text-sm font-semibold">Survey JSON</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            The definition behind the form on the page. Type, and the survey follows a
            moment later.
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close the JSON editor" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      {error && (
        <p className="text-destructive flex items-start gap-2 border-b px-4 py-2 text-xs">
          <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="min-h-0 flex-1">
        <JsonEditor value={source} onChange={onSourceChange} dark={resolvedTheme === "dark"} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t p-3">
        <p className="text-muted-foreground text-xs">
          {edited ? "Edited in this window only." : "Unchanged from the template."}
        </p>
        <Button variant="outline" size="sm" className="gap-2" onClick={onRevert}>
          <RotateCcwIcon />
          Revert
        </Button>
      </div>
    </aside>
  );
}
