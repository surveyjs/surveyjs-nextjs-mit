"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Code2Icon,
  MoonIcon,
  RotateCcwIcon,
  SquareDashedIcon,
  SunIcon,
  UserRoundIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Where the demos came from — the template's own admin shell. */
const HOME = "/claims";

/**
 * The reviewer's toolbar, floating over the mock site.
 *
 * Every control exists to make a single claim checkable:
 *
 *  - **Prefill / Reset** — so the rest can be shown on a filled form at once;
 *  - **Configure JSON live** — the form is a JSON document, editable over the
 *    running page;
 *  - **Edit the user** — the account the form is rendered for, in a popup whose
 *    editor is itself a SurveyJS survey, with the resulting object shown as JSON;
 *  - **Highlight SurveyJS Render** — scrolls to the form and outlines it, which
 *    is the first thing anyone asks when a form looks native to its host.
 *
 * It is deliberately quiet — half-transparent until pointed at — because the
 * demo's claim is that the survey belongs to the page, and a loud control panel
 * hovering over it would undercut that. Nothing here would ship in a host site.
 */
export function DemoDock({
  highlight,
  onToggleHighlight,
  onPrefill,
  onReset,
  onEditJson,
  onEditUser,
  edited,
  panelOpen,
  userOpen,
  align = "center",
}: {
  highlight: boolean;
  onToggleHighlight: () => void;
  onPrefill: () => void;
  onReset: () => void;
  onEditJson: () => void;
  onEditUser: () => void;
  /** Either editor holds changes — worth a dot on the button. */
  edited: boolean;
  panelOpen: boolean;
  userOpen: boolean;
  /** Steps aside when the editor panel would otherwise cover it. */
  align?: "center" | "left";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const position = align === "left" ? "left-6" : "left-1/2 -translate-x-1/2";
  const isDark = resolvedTheme === "dark";
  const divider = <span className="bg-border mx-0.5 h-5 w-px shrink-0" aria-hidden />;

  return (
    <div
      data-demo-dock=""
      className={cn(
        "demo-dock bg-background/85 pointer-events-auto fixed bottom-4 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full border px-2 py-1.5 shadow-lg backdrop-blur",
        position,
      )}
      role="toolbar"
      aria-label="Embedded demo tools"
    >
      {/* The way back: these pages carry none of the template's chrome, and the
          sidebar entries open them in a new tab. */}
      <a
        href={HOME}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
        title="Back to the SurveyJS template"
      >
        SurveyJS demos
      </a>

      {divider}

      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1.5 rounded-full"
        title="Fill every page with sample answers"
        onClick={onPrefill}
      >
        <WandSparklesIcon />
        <span className="hidden sm:inline">Prefill</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 gap-1.5 rounded-full"
        title="Clear the answers and start the form again"
        onClick={onReset}
      >
        <RotateCcwIcon />
        <span className="hidden sm:inline">Reset</span>
      </Button>

      {divider}

      {/* The one control that is meant to be pressed, so it is the one control
          that is painted in the host brand rather than hidden in the greys. */}
      <Button
        size="sm"
        className={cn(
          "demo-brand-bg text-primary-foreground shrink-0 gap-1.5 rounded-full font-semibold shadow-sm hover:opacity-90",
          panelOpen && "ring-ring/60 ring-2 ring-offset-1",
        )}
        aria-pressed={panelOpen}
        title="Edit the form's JSON, or the user it is rendered for — the page follows as you type"
        onClick={onEditJson}
      >
        <Code2Icon />
        Configure JSON live
        {edited && (
          <span className="size-1.5 rounded-full bg-current opacity-70" aria-label="edited" />
        )}
      </Button>

      <Button
        variant={userOpen ? "secondary" : "ghost"}
        size="sm"
        className={cn("shrink-0 gap-1.5 rounded-full", userOpen && "shadow-inner")}
        aria-pressed={userOpen}
        aria-label="Edit the user"
        title="Change the signed-in user the form is rendered for — the editor is a SurveyJS form too"
        onClick={onEditUser}
      >
        <UserRoundIcon />
        <span className="hidden sm:inline">Edit the user</span>
      </Button>

      <Button
        variant={highlight ? "secondary" : "ghost"}
        size="sm"
        className={cn("shrink-0 gap-1.5 rounded-full", highlight && "shadow-inner")}
        aria-pressed={highlight}
        aria-label="Highlight SurveyJS Render"
        title="Scroll to the form and outline it — everything outside the outline is the host site's own markup"
        onClick={onToggleHighlight}
      >
        <SquareDashedIcon />
        <span className="hidden sm:inline">Highlight SurveyJS Render</span>
      </Button>

      {divider}

      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 rounded-full"
        title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle colour scheme"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {mounted && isDark ? <MoonIcon /> : <SunIcon />}
        <span className="sr-only">Toggle colour scheme</span>
      </Button>
    </div>
  );
}
