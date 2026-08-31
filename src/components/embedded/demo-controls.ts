import {
  AppWindowIcon,
  LayoutTemplateIcon,
  MessageCircleIcon,
  PanelRightIcon,
  type LucideIcon,
} from "lucide-react";
import type { SurveyData, SurveyJSON } from "@/schemas";

/**
 * The knobs the embedded demo's toolbar offers, kept out of the components so
 * the orchestrator and the toolbar agree on one list.
 */

/** One survey the demo can drop into the host site. */
export interface DemoSurvey {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly json: SurveyJSON;
  /** Answers behind the toolbar's Prefill button. */
  readonly prefill: SurveyData;
}

export type PlacementId = "inline" | "modal" | "drawer" | "bubble";

export interface Placement {
  readonly id: PlacementId;
  readonly label: string;
  readonly hint: string;
  readonly icon: LucideIcon;
}

export const PLACEMENTS: readonly Placement[] = [
  {
    id: "inline",
    label: "Inline section",
    hint: "The survey is part of the page, server-rendered with it.",
    icon: LayoutTemplateIcon,
  },
  {
    id: "modal",
    label: "Modal dialog",
    hint: "Opened from a call to action, centred over the page.",
    icon: AppWindowIcon,
  },
  {
    id: "drawer",
    label: "Side drawer",
    hint: "Slides in from the edge, the page stays visible.",
    icon: PanelRightIcon,
  },
  {
    id: "bubble",
    label: "Floating widget",
    hint: "A launcher in the corner, the way in-app feedback usually arrives.",
    icon: MessageCircleIcon,
  },
];

export interface DemoBrand {
  readonly id: string;
  readonly label: string;
  /** `null` restores the template's own neutral shadcn palette. */
  readonly primary: string | null;
  readonly primaryForeground?: string;
  /** Colour of the toolbar swatch, needed even when `primary` is null. */
  readonly swatch: string;
}

export const BRANDS: readonly DemoBrand[] = [
  { id: "neutral", label: "Neutral", primary: null, swatch: "oklch(0.3 0 0)" },
  { id: "indigo", label: "Indigo", primary: "oklch(0.52 0.21 275)", swatch: "oklch(0.52 0.21 275)" },
  { id: "violet", label: "Violet", primary: "oklch(0.56 0.24 302)", swatch: "oklch(0.56 0.24 302)" },
  { id: "emerald", label: "Emerald", primary: "oklch(0.55 0.14 163)", swatch: "oklch(0.55 0.14 163)" },
  {
    id: "amber",
    label: "Amber",
    primary: "oklch(0.75 0.16 66)",
    primaryForeground: "oklch(0.22 0.03 66)",
    swatch: "oklch(0.75 0.16 66)",
  },
  { id: "rose", label: "Rose", primary: "oklch(0.59 0.21 16)", swatch: "oklch(0.59 0.21 16)" },
];

export const DEFAULT_BRAND_ID = "indigo";

export function getBrand(brandId: string): DemoBrand {
  return BRANDS.find((brand) => brand.id === brandId) ?? BRANDS[0];
}

const BRAND_ATTRIBUTE = "data-demo-brand";
const BRAND_VAR = "--demo-brand";
const BRAND_FOREGROUND_VAR = "--demo-brand-foreground";

/**
 * Writes the brand hue onto `<html>`.
 *
 * Two inline custom properties plus one attribute; the attribute is what lets
 * `globals.css` route `--primary`, `--primary-foreground` and `--ring` at the
 * brand — which is the whole demonstration. The survey has no palette of its
 * own to fight, so it re-skins with the host site in the same frame.
 *
 * The neutral option clears both, and the template's own shadcn palette (light
 * and dark) applies again.
 */
export function applyBrand(brand: DemoBrand): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (!brand.primary) {
    root.removeAttribute(BRAND_ATTRIBUTE);
    root.style.removeProperty(BRAND_VAR);
    root.style.removeProperty(BRAND_FOREGROUND_VAR);
    return;
  }

  root.setAttribute(BRAND_ATTRIBUTE, brand.id);
  root.style.setProperty(BRAND_VAR, brand.primary);
  root.style.setProperty(
    BRAND_FOREGROUND_VAR,
    brand.primaryForeground ?? "oklch(0.99 0 0)",
  );
}

/**
 * The same write, as a string the page runs while the HTML is still parsing.
 *
 * Without it the first painted frame would carry the template's neutral palette
 * and flip to the brand a frame later — the one flash a demo cannot afford.
 */
export function brandBootScript(brandId: string): string {
  const brand = getBrand(brandId);
  if (!brand.primary) return "";
  const foreground = brand.primaryForeground ?? "oklch(0.99 0 0)";
  return [
    "var e=document.documentElement;",
    `e.setAttribute(${JSON.stringify(BRAND_ATTRIBUTE)},${JSON.stringify(brand.id)});`,
    `e.style.setProperty(${JSON.stringify(BRAND_VAR)},${JSON.stringify(brand.primary)});`,
    `e.style.setProperty(${JSON.stringify(BRAND_FOREGROUND_VAR)},${JSON.stringify(foreground)});`,
  ].join("");
}
