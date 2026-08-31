import type { SurveyData } from "./types";

/**
 * The catalogue of a fictional coffee roaster, the rules that turn quiz answers
 * into a recommended bag, and the arithmetic of a cart.
 *
 * Single source of truth for the Shop demo, the same way
 * `cloud-platform-pricing.ts` is for the Cumulora one: the quiz JSON builds its
 * choices from these constants, the product page renders from them, and the cart
 * adds them up. A price or a roast changes in exactly one place.
 *
 * Why the money is here and not in survey `calculatedValues`: the demo needs a
 * *ranked match with reasons* and a *list of cart lines*, neither of which an
 * expression string can hold. The survey JSON keeps what is genuinely form logic.
 */

export type RoastId = "light" | "medium" | "dark";
export type ProfileId = "fruity" | "chocolate" | "caramel";
export type BodyId = "light" | "balanced" | "full";

export interface Coffee {
  readonly id: string;
  readonly name: string;
  readonly origin: string;
  readonly roast: RoastId;
  readonly profile: ProfileId;
  readonly body: BodyId;
  readonly decaf: boolean;
  readonly notes: readonly string[];
  readonly blurb: string;
  /** Price of a 250 g bag. Every other size is derived from it. */
  readonly price: number;
  /** Brew methods this one is roasted for. */
  readonly bestFor: readonly string[];
  /** Bag colour on the product page. Nothing here is a photograph. */
  readonly hue: string;
}

export const COFFEES: readonly Coffee[] = [
  {
    id: "sunrise",
    name: "Sunrise Yirgacheffe",
    origin: "Ethiopia · washed",
    roast: "light",
    profile: "fruity",
    body: "light",
    decaf: false,
    notes: ["bergamot", "peach", "jasmine"],
    blurb:
      "A light roast that tastes like fruit rather than like roasting. Best without milk, which would flatten it.",
    price: 21,
    bestFor: ["pourOver", "drip"],
    hue: "oklch(0.78 0.15 75)",
  },
  {
    id: "cedar",
    name: "Cedar & Cocoa",
    origin: "Colombia · Brazil blend",
    roast: "medium",
    profile: "chocolate",
    body: "balanced",
    decaf: false,
    notes: ["dark cocoa", "hazelnut", "orange peel"],
    blurb:
      "Our house blend, and the safe answer to almost every question. Sweet enough black, sturdy enough with milk.",
    price: 18,
    bestFor: ["espresso", "drip", "pourOver", "capsule"],
    hue: "oklch(0.55 0.09 55)",
  },
  {
    id: "nightshift",
    name: "Night Shift",
    origin: "Sumatra · Peru",
    roast: "dark",
    profile: "caramel",
    body: "full",
    decaf: false,
    notes: ["molasses", "baker's chocolate", "cedar"],
    blurb:
      "Roasted long and low for the people who take it strong and with milk. Holds its shape under steam.",
    price: 17,
    bestFor: ["espresso", "frenchPress"],
    hue: "oklch(0.38 0.05 40)",
  },
  {
    id: "goldenhour",
    name: "Golden Hour",
    origin: "Guatemala · Huehuetenango",
    roast: "medium",
    profile: "caramel",
    body: "balanced",
    decaf: false,
    notes: ["caramel", "red apple", "brown sugar"],
    blurb:
      "The sweet one. A medium roast with enough sugar of its own that nobody reaches for the sugar.",
    price: 19,
    bestFor: ["pourOver", "frenchPress", "drip"],
    hue: "oklch(0.72 0.13 62)",
  },
  {
    id: "halflight",
    name: "Half Light Decaf",
    origin: "Colombia · sugarcane process",
    roast: "medium",
    profile: "chocolate",
    body: "balanced",
    decaf: true,
    notes: ["milk chocolate", "almond", "dried fig"],
    blurb:
      "Decaffeinated with sugarcane ethanol rather than solvents, which is why it still tastes like coffee at 9 pm.",
    price: 18,
    bestFor: ["espresso", "drip", "pourOver", "frenchPress", "capsule"],
    hue: "oklch(0.62 0.07 285)",
  },
];

export function getCoffee(id: string): Coffee {
  const coffee = COFFEES.find((candidate) => candidate.id === id);
  if (!coffee) throw new Error(`Unknown coffee: ${id}`);
  return coffee;
}

export interface Grind {
  readonly id: string;
  readonly label: string;
}

export const GRINDS: readonly Grind[] = [
  { id: "whole", label: "Whole bean" },
  { id: "coarse", label: "Coarse" },
  { id: "medium", label: "Medium" },
  { id: "mediumFine", label: "Medium-fine" },
  { id: "fine", label: "Fine" },
];

export interface BrewMethod {
  readonly id: string;
  readonly label: string;
  /** The grind we ship for this brewer unless the visitor overrides it. */
  readonly grind: string;
}

export const BREW_METHODS: readonly BrewMethod[] = [
  { id: "espresso", label: "Espresso machine", grind: "fine" },
  { id: "pourOver", label: "Pour-over (V60, Chemex)", grind: "mediumFine" },
  { id: "frenchPress", label: "French press", grind: "coarse" },
  { id: "drip", label: "Drip machine", grind: "medium" },
  { id: "capsule", label: "Refillable capsules", grind: "fine" },
];

export interface BagSize {
  readonly id: string;
  readonly label: string;
  /** Multiplier on the 250 g price. Bigger bags are cheaper per gram. */
  readonly multiplier: number;
}

export const BAG_SIZES: readonly BagSize[] = [
  { id: "250g", label: "250 g", multiplier: 1 },
  { id: "500g", label: "500 g", multiplier: 1.85 },
  { id: "1kg", label: "1 kg", multiplier: 3.4 },
];

export interface Cadence {
  readonly id: string;
  readonly label: string;
  readonly short: string;
  /** Fraction off for standing orders. */
  readonly discount: number;
}

export const CADENCES: readonly Cadence[] = [
  { id: "oneOff", label: "One-time purchase", short: "One-time", discount: 0 },
  { id: "every2Weeks", label: "Every 2 weeks — save 10%", short: "Every 2 weeks", discount: 0.1 },
  { id: "monthly", label: "Every month — save 10%", short: "Monthly", discount: 0.1 },
];

export function getCadence(id: string): Cadence {
  return CADENCES.find((candidate) => candidate.id === id) ?? CADENCES[0];
}

/** Free shipping over this subtotal — the line every US store puts in its header. */
export const FREE_SHIPPING_OVER = 35;

/** Shipping prices, keyed by the `shippingMethod` values the checkout survey uses. */
export const SHIPPING_RATES: Record<string, number> = {
  standard: 6,
  express: 12,
  overnight: 29,
};

export const TAX_RATE = 0.085;

export function priceFor(coffee: Coffee, sizeId: string): number {
  const size = BAG_SIZES.find((candidate) => candidate.id === sizeId) ?? BAG_SIZES[0];
  return Math.round(coffee.price * size.multiplier * 100) / 100;
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/* ── the match ──────────────────────────────────────────────────────────────── */

export interface CoffeeMatch {
  readonly coffee: Coffee;
  readonly grind: string;
  readonly size: string;
  readonly cadence: string;
  /** Why this bag, in the visitor's own words. */
  readonly reasons: readonly string[];
  /** False until the quiz has been answered at all. */
  readonly started: boolean;
  /** True once every question the match leans on has an answer. */
  readonly complete: boolean;
}

const TASTE_TO_PROFILE: Record<string, ProfileId> = {
  bright: "fruity",
  chocolate: "chocolate",
  sweet: "caramel",
};

const ROAST_PREFERENCE: Record<string, RoastId> = {
  light: "light",
  medium: "medium",
  dark: "dark",
};

/**
 * How much coffee a household gets through, turned into a bag and a cadence.
 *
 * This is the part of the quiz visitors cannot work out for themselves, and the
 * reason a finder beats a filter: nobody knows whether they want 250 g or a kilo
 * until somebody converts cups per day into a delivery schedule for them.
 */
const CONSUMPTION: Record<string, { size: string; cadence: string; reason: string }> = {
  "1": { size: "250g", cadence: "monthly", reason: "a cup a day is a 250 g bag a month" },
  "2": { size: "500g", cadence: "monthly", reason: "two cups a day is 500 g a month" },
  "3-4": {
    size: "500g",
    cadence: "every2Weeks",
    reason: "three or four cups a day empties 500 g in a fortnight",
  },
  "5+": {
    size: "1kg",
    cadence: "every2Weeks",
    reason: "five cups a day is a kilo every fortnight, and the kilo bag is cheaper per cup",
  },
};

/**
 * Ranks the catalogue against the answers and returns the winner.
 *
 * Called on every answer change, so it is a pure function of `data` with no
 * memoisation of its own — the page memoises the result.
 */
export function matchCoffee(data: SurveyData): CoffeeMatch {
  const brew = typeof data.brewMethod === "string" ? data.brewMethod : "";
  const taste = typeof data.taste === "string" ? data.taste : "";
  const roastWanted = typeof data.roast === "string" ? ROAST_PREFERENCE[data.roast] : undefined;
  const withMilk = data.withMilk === true;
  const cups = typeof data.cupsPerDay === "string" ? data.cupsPerDay : "";
  const decafWanted = data.decaf === true;

  const started = Boolean(brew || taste || cups) || decafWanted || withMilk;
  const complete = Boolean(brew && taste && cups);

  const wantedProfile = TASTE_TO_PROFILE[taste];

  const scored = COFFEES.map((coffee) => {
    let score = 0;
    // Decaf is a hard filter dressed up as a score: nobody who asked for decaf
    // wants the closest caffeinated thing.
    if (decafWanted) score += coffee.decaf ? 100 : -100;
    else if (coffee.decaf) score -= 40;

    if (wantedProfile && coffee.profile === wantedProfile) score += 6;
    if (roastWanted && coffee.roast === roastWanted) score += 4;
    if (brew && coffee.bestFor.includes(brew)) score += 3;
    if (withMilk && coffee.body === "full") score += 3;
    if (withMilk && coffee.body === "light") score -= 3;
    if (!withMilk && coffee.body === "light") score += 1;
    return { coffee, score };
  }).sort((a, b) => b.score - a.score);

  const coffee = scored[0].coffee;

  const reasons: string[] = [];
  if (decafWanted) reasons.push("you asked for decaf, and this is the only one we roast");
  if (wantedProfile && coffee.profile === wantedProfile) {
    reasons.push(`you went for ${coffee.notes.slice(0, 2).join(" and ")} over anything sharper`);
  }
  if (roastWanted && coffee.roast === roastWanted) {
    reasons.push(`a ${coffee.roast} roast is what you said you drink`);
  }
  if (withMilk && coffee.body === "full") reasons.push("it stays sweet under milk");
  if (!withMilk && coffee.body !== "full") reasons.push("it holds up black");

  const brewMethod = BREW_METHODS.find((candidate) => candidate.id === brew);
  const grind = brewMethod?.grind ?? "whole";
  if (brewMethod) {
    reasons.push(
      `ground ${GRINDS.find((g) => g.id === grind)?.label.toLowerCase()} for your ${brewMethod.label.toLowerCase()}`,
    );
  }

  const consumption = CONSUMPTION[cups];
  if (consumption) reasons.push(consumption.reason);

  return {
    coffee,
    grind,
    size: consumption?.size ?? "250g",
    cadence: consumption?.cadence ?? "oneOff",
    reasons,
    started,
    complete,
  };
}

/* ── the cart ───────────────────────────────────────────────────────────────── */

export interface CartItem {
  readonly key: string;
  readonly coffeeId: string;
  readonly grind: string;
  readonly size: string;
  readonly cadence: string;
  readonly quantity: number;
}

export interface CartTotals {
  readonly subtotal: number;
  readonly subscriptionDiscount: number;
  readonly shipping: number;
  readonly shippingLabel: string;
  readonly tax: number;
  readonly total: number;
  readonly itemCount: number;
  /** How much more to spend before shipping stops being charged. */
  readonly toFreeShipping: number;
}

/**
 * Adds the cart up.
 *
 * `shippingMethod` comes out of the checkout survey, which is the second half of
 * this demo's point: the order summary is not a static block next to the form,
 * it is downstream of it. Pick Overnight on the Shipping step and the total in
 * the sidebar moves while the form is still open.
 */
export function cartTotals(items: readonly CartItem[], shippingMethod?: unknown): CartTotals {
  let subtotal = 0;
  let subscriptionDiscount = 0;

  for (const item of items) {
    const line = priceFor(getCoffee(item.coffeeId), item.size) * item.quantity;
    subtotal += line;
    subscriptionDiscount += line * getCadence(item.cadence).discount;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  subscriptionDiscount = Math.round(subscriptionDiscount * 100) / 100;

  const afterDiscount = subtotal - subscriptionDiscount;
  const method = typeof shippingMethod === "string" ? shippingMethod : "standard";
  const rate = SHIPPING_RATES[method] ?? 0;
  // Free shipping is on the standard rate only — paying for Overnight and then
  // not paying for it is the kind of thing a demo gets asked about.
  const shipping = method === "standard" && afterDiscount >= FREE_SHIPPING_OVER ? 0 : rate;
  const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;

  return {
    subtotal,
    subscriptionDiscount,
    shipping,
    shippingLabel:
      method === "standard"
        ? shipping === 0
          ? "Standard — free"
          : "Standard (3–5 days)"
        : method === "express"
          ? "Express (2 days)"
          : "Overnight",
    tax,
    total: Math.round((afterDiscount + shipping + tax) * 100) / 100,
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    toFreeShipping: Math.max(0, Math.round((FREE_SHIPPING_OVER - afterDiscount) * 100) / 100),
  };
}
