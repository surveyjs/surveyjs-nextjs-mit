"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ClipboardListIcon,
  Code2Icon,
  MaximizeIcon,
  MinimizeIcon,
  MoonIcon,
  PaletteIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  SunIcon,
  WandSparklesIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BRANDS,
  PLACEMENTS,
  type DemoSurvey,
  type PlacementId,
} from "./demo-controls";
import { cn } from "@/lib/utils";

/**
 * The reviewer's toolbar, floating over the mock site.
 *
 * It is deliberately quiet — half-transparent until pointed at — because the
 * demo's claim is that the survey belongs to the page, and a loud control panel
 * hovering over it would undercut that. Everything it does is a demo affordance:
 * nothing here would ship inside a real host site.
 */
export function DemoDock({
  surveys,
  surveyId,
  onSurveyChange,
  placement,
  onPlacementChange,
  brandId,
  onBrandChange,
  onPrefill,
  onReset,
  onEditJson,
  jsonEdited,
  align = "center",
}: {
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
  /** Steps aside when a side panel would otherwise cover it. */
  align?: "center" | "left";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const position = align === "left" ? "left-6" : "left-1/2 -translate-x-1/2";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    sync();
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement)
      void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen().catch(() => {});
  };

  if (collapsed) {
    return (
      <div
        data-demo-dock=""
        className={cn(
          "demo-dock pointer-events-auto fixed bottom-4 z-[70]",
          position,
        )}
      >
        <Button
          variant="outline"
          size="sm"
          className="bg-background/80 gap-2 rounded-full shadow-lg backdrop-blur"
          onClick={() => setCollapsed(false)}
        >
          <SlidersHorizontalIcon />
          Demo tools
        </Button>
      </div>
    );
  }

  const divider = (
    <span className="bg-border mx-0.5 h-5 w-px shrink-0" aria-hidden />
  );
  const isDark = resolvedTheme === "dark";

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
      <span className="text-muted-foreground hidden shrink-0 items-center gap-1.5 pr-1 pl-1.5 text-[11px] font-medium tracking-wide uppercase md:flex">
        SurveyJS demo
      </span>

      {divider}

      {/* Which form, then where it sits: the two halves of the claim that one
          JSON definition drops into any slot on the page. A demo built around a
          single definition has nothing to swap, so the switcher stays away. */}
      {surveys.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 rounded-full"
              // The label is hidden on narrow viewports, so name the button
              // explicitly rather than leaving it to the icon.
              aria-label="Survey definition"
              title="Swap in a different survey definition"
            >
              <ClipboardListIcon />
              <span className="hidden lg:inline">
                {surveys.find((survey) => survey.id === surveyId)?.label ??
                  "Survey"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-72">
            <DropdownMenuLabel>Survey definition</DropdownMenuLabel>
            {surveys.map((survey) => (
              <DropdownMenuItem
                key={survey.id}
                onSelect={() => onSurveyChange(survey.id)}
                className="flex-col items-start gap-0.5"
              >
                <span className="flex w-full items-center gap-2">
                  {survey.label}
                  {survey.id === surveyId && (
                    <span className="text-muted-foreground ml-auto text-xs">
                      active
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground text-xs leading-snug whitespace-normal">
                  {survey.hint}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {surveys.length > 1 && divider}

      <span className="flex shrink-0 items-center gap-0.5">
        {PLACEMENTS.map((item) => {
          const active = item.id === placement;
          return (
            <Button
              key={item.id}
              variant={active ? "secondary" : "ghost"}
              size="icon-sm"
              className={cn("rounded-full", active && "shadow-inner")}
              aria-pressed={active}
              title={`${item.label} — ${item.hint}`}
              onClick={() => onPlacementChange(item.id)}
            >
              <item.icon />
              <span className="sr-only">{item.label}</span>
            </Button>
          );
        })}
      </span>

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
        title="Clear the answers and start the survey again"
        onClick={onReset}
      >
        <RotateCcwIcon />
        <span className="hidden sm:inline">Reset</span>
      </Button>

      <Button
        variant={jsonEdited ? "secondary" : "ghost"}
        size="sm"
        className="shrink-0 gap-1.5 rounded-full"
        title="Edit the survey JSON and watch the page follow"
        onClick={onEditJson}
      >
        <Code2Icon />
        <span className="hidden sm:inline">JSON</span>
        {jsonEdited && (
          <span
            className="demo-brand-bg size-1.5 rounded-full"
            aria-label="edited"
          />
        )}
      </Button>

      {divider}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 rounded-full"
            title="Change the host site's brand colour — the survey follows it"
          >
            <PaletteIcon />
            <span
              className="size-3 rounded-full ring-1 ring-black/10"
              style={{
                backgroundColor:
                  BRANDS.find((brand) => brand.id === brandId)?.swatch ??
                  "transparent",
              }}
              aria-hidden
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" side="top" className="w-48">
          <DropdownMenuLabel>Host brand colour</DropdownMenuLabel>
          {BRANDS.map((brand) => (
            <DropdownMenuItem
              key={brand.id}
              onSelect={() => onBrandChange(brand.id)}
            >
              <span
                className="size-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: brand.swatch }}
                aria-hidden
              />
              {brand.label}
              {brand.id === brandId && (
                <span className="text-muted-foreground ml-auto text-xs">
                  active
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 rounded-full"
        title={
          mounted
            ? `Switch to ${isDark ? "light" : "dark"} mode`
            : "Toggle colour scheme"
        }
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {mounted && isDark ? <MoonIcon /> : <SunIcon />}
        <span className="sr-only">Toggle colour scheme</span>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 rounded-full"
        title={fullscreen ? "Leave full screen" : "Go full screen"}
        onClick={toggleFullscreen}
      >
        {fullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        <span className="sr-only">Toggle full screen</span>
      </Button>

      {divider}

      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground shrink-0 rounded-full"
        title="Hide these tools"
        onClick={() => setCollapsed(true)}
      >
        <XIcon />
        <span className="sr-only">Hide demo tools</span>
      </Button>
    </div>
  );
}
