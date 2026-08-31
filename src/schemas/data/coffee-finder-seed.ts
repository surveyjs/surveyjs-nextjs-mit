import type { SurveyData } from "../types";

/**
 * Demo "prefill" data for the coffee finder (`coffeeFinderJson`).
 *
 * Tuned to land on the most interesting match rather than the safest one: an
 * espresso machine and milk push the ranking away from the house blend and onto
 * the dark roast, and three-to-four cups a day turns into a 500 g bag every
 * fortnight — so the toolbar's Prefill visibly changes the product on sale, the
 * grind, the size and the cadence in one click.
 * Renderer-agnostic: depends on nothing but `SurveyData`.
 */
export const coffeeFinderSample: SurveyData = {
  brewMethod: "espresso",
  taste: "sweet",
  roast: "dark",
  withMilk: true,
  cupsPerDay: "3-4",
  decaf: false,
};
