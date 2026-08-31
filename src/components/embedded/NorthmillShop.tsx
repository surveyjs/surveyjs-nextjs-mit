"use client";

import {
  CheckIcon,
  CoffeeIcon,
  LeafIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
  XIcon,
} from "lucide-react";
import {
  BAG_SIZES,
  CADENCES,
  COFFEES,
  FREE_SHIPPING_OVER,
  GRINDS,
  cartTotals,
  formatMoney,
  getCadence,
  getCoffee,
  priceFor,
  type CartItem,
  type CartTotals,
  type Coffee,
  type CoffeeMatch,
} from "@/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The storefront of Northmill Coffee — a fictional roaster.
 *
 * Everything here is a plain shadcn surface: `bg-card`, `border`, `Button`,
 * `Badge`. That is the point of this demo. The cart and the checkout are the
 * two screens every reviewer has seen a hundred times, so if the SurveyJS form
 * in the middle of them needed one line of bespoke CSS to look like it belonged,
 * it would be obvious immediately. It does not — the shadcn adapter is the whole
 * styling story, and nothing in this file touches an `.sd-` class.
 *
 * No photographs: the product renders are SVG, so the demo carries no image
 * licences and can live in a public repository.
 */

/* ── the product render ─────────────────────────────────────────────────────── */

export function CoffeeBag({
  coffee,
  className,
}: {
  coffee: Coffee;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      role="img"
      aria-label={`A bag of ${coffee.name}`}
    >
      <defs>
        <linearGradient id={`bag-${coffee.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={coffee.hue} stopOpacity="1" />
          <stop offset="100%" stopColor={coffee.hue} stopOpacity="0.72" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="246" rx="66" ry="8" fill="currentColor" opacity="0.08" />

      <path
        d="M32 62 h136 v166 a14 14 0 0 1 -14 14 H46 a14 14 0 0 1 -14 -14 Z"
        fill={`url(#bag-${coffee.id})`}
      />
      <path d="M32 62 h44 v180 H46 a14 14 0 0 1 -14 -14 Z" fill="#fff" opacity="0.08" />

      <rect x="26" y="40" width="148" height="24" rx="7" fill={coffee.hue} />
      <rect x="26" y="40" width="148" height="24" rx="7" fill="#000" opacity="0.22" />
      <rect x="88" y="30" width="24" height="14" rx="4" fill="#000" opacity="0.3" />

      <rect
        x="54"
        y="104"
        width="92"
        height="98"
        rx="9"
        fill="var(--card)"
        opacity="0.94"
      />
      <text
        x="100"
        y="136"
        textAnchor="middle"
        fontSize="19"
        fontWeight="700"
        letterSpacing="2"
        fill="currentColor"
        opacity="0.85"
      >
        NM
      </text>
      <line x1="70" y1="148" x2="130" y2="148" stroke="currentColor" opacity="0.2" />
      <text
        x="100"
        y="167"
        textAnchor="middle"
        fontSize="10"
        letterSpacing="1.6"
        fill="currentColor"
        opacity="0.7"
      >
        {coffee.roast.toUpperCase()}
      </text>
      <text
        x="100"
        y="185"
        textAnchor="middle"
        fontSize="8.5"
        fill="currentColor"
        opacity="0.55"
      >
        ROASTED TO ORDER
      </text>
    </svg>
  );
}

/* ── chrome ─────────────────────────────────────────────────────────────────── */

export function ShopHeader({
  cartCount,
  onCart,
  onShop,
  onFinder,
  view,
}: {
  cartCount: number;
  onCart: () => void;
  onShop: () => void;
  onFinder: () => void;
  view: "shop" | "cart";
}) {
  return (
    <>
      <div className="demo-brand-bg text-primary-foreground px-6 py-2 text-center text-xs">
        Free US and EU shipping over {formatMoney(FREE_SHIPPING_OVER)} · Roasted Mondays and
        Thursdays, shipped the same day
      </div>
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-3.5">
          <button
            type="button"
            onClick={onShop}
            className="flex items-center gap-2 text-left"
            aria-label="Northmill Coffee — back to the shop"
          >
            <span className="demo-brand-bg text-primary-foreground grid size-8 place-items-center rounded-lg">
              <CoffeeIcon className="size-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Northmill</span>
          </button>

          <nav className="text-muted-foreground hidden items-center gap-6 text-sm md:flex">
            <span className="text-foreground font-medium">Coffee</span>
            <span>Subscriptions</span>
            <span>Equipment</span>
            <span>Our roastery</span>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onFinder} className="hidden sm:inline-flex">
              Find your coffee
            </Button>
            <Button
              variant={view === "cart" ? "default" : "outline"}
              size="sm"
              onClick={onCart}
              className="relative"
            >
              <ShoppingBagIcon />
              Cart
              {cartCount > 0 ? (
                <span className="demo-brand-bg text-primary-foreground absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full text-[10px] font-semibold">
                  {cartCount}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}

export function ShopIntro() {
  return (
    <div className="pt-10 pb-8 text-center">
      <Badge variant="outline" className="mb-4">
        <LeafIcon /> Single origin and small-batch blends
      </Badge>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Stop guessing which bag is <span className="demo-gradient-text">yours</span>
      </h1>
      <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-[15px]">
        Five questions is faster than reading five product pages. Answer them and the bag on
        the left becomes the one we would have handed you across the counter.
      </p>
    </div>
  );
}

/* ── the buy box ────────────────────────────────────────────────────────────── */

export interface Selection {
  readonly coffeeId: string;
  readonly grind: string;
  readonly size: string;
  readonly cadence: string;
  readonly quantity: number;
}

function OptionRow({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="text-muted-foreground mb-2 flex w-full items-baseline gap-2 text-xs font-medium tracking-wide uppercase">
        {label}
        {hint ? <span className="ml-auto text-[11px] normal-case">{hint}</span> : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
            className={cn(
              "focus-visible:ring-ring/50 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
              value === option.id
                ? "border-primary bg-primary/10 text-foreground font-medium"
                : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function ProductPanel({
  selection,
  onSelectionChange,
  onAddToCart,
  matched,
  match,
}: {
  selection: Selection;
  onSelectionChange: (next: Selection) => void;
  onAddToCart: () => void;
  /** True once the quiz has produced this selection rather than the default. */
  matched: boolean;
  match: CoffeeMatch;
}) {
  const coffee = getCoffee(selection.coffeeId);
  const unit = priceFor(coffee, selection.size);
  const cadence = getCadence(selection.cadence);
  const line = Math.round(unit * selection.quantity * (1 - cadence.discount) * 100) / 100;

  const set = (patch: Partial<Selection>) => onSelectionChange({ ...selection, ...patch });

  return (
    <div id="product" className="scroll-mt-24">
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)]">
          <div className="bg-muted/40 flex items-center justify-center rounded-lg p-4">
            <CoffeeBag coffee={coffee} className="text-foreground h-44 w-auto" />
          </div>

          <div className="min-w-0">
            {matched ? (
              <Badge className="mb-2">
                <CheckIcon /> Matched to your answers
              </Badge>
            ) : (
              <Badge variant="secondary" className="mb-2">
                Best seller
              </Badge>
            )}

            <h2 className="text-xl font-semibold tracking-tight">{coffee.name}</h2>
            <p className="text-muted-foreground text-sm">{coffee.origin}</p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {coffee.notes.map((note) => (
                <Badge key={note} variant="outline" className="capitalize">
                  {note}
                </Badge>
              ))}
            </div>

            <p className="mt-3 text-[15px] leading-relaxed">{coffee.blurb}</p>

            <div className="text-muted-foreground mt-3 flex items-center gap-1 text-sm">
              <StarIcon className="size-3.5 fill-current" />
              <StarIcon className="size-3.5 fill-current" />
              <StarIcon className="size-3.5 fill-current" />
              <StarIcon className="size-3.5 fill-current" />
              <StarIcon className="size-3.5 fill-current" />
              <span className="ml-1">4.8 · 1,204 reviews</span>
            </div>
          </div>
        </div>

        <div className="space-y-5 border-t p-6">
          <OptionRow
            label="Grind"
            hint={matched ? `set for your ${match.grind === "whole" ? "beans" : "brewer"}` : undefined}
            options={GRINDS}
            value={selection.grind}
            onChange={(grind) => set({ grind })}
          />
          <OptionRow
            label="Size"
            options={BAG_SIZES.map((size) => ({
              id: size.id,
              label: `${size.label} — ${formatMoney(priceFor(coffee, size.id))}`,
            }))}
            value={selection.size}
            onChange={(size) => set({ size })}
          />
          <OptionRow
            label="Delivery"
            options={CADENCES.map((entry) => ({ id: entry.id, label: entry.label }))}
            value={selection.cadence}
            onChange={(nextCadence) => set({ cadence: nextCadence })}
          />

          <div className="flex flex-wrap items-center gap-3 border-t pt-5">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="One fewer bag"
                disabled={selection.quantity <= 1}
                onClick={() => set({ quantity: Math.max(1, selection.quantity - 1) })}
              >
                <MinusIcon />
              </Button>
              <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                {selection.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="One more bag"
                onClick={() => set({ quantity: selection.quantity + 1 })}
              >
                <PlusIcon />
              </Button>
            </div>

            <Button size="lg" className="flex-1" onClick={onAddToCart}>
              <ShoppingBagIcon />
              Add to cart — {formatMoney(line)}
            </Button>
          </div>

          {cadence.discount > 0 ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <RefreshCwIcon className="size-3.5" />
              {cadence.short} delivery, 10% off every bag, skip or cancel from your account.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MatchNote({ match, onChangeAnswers }: { match: CoffeeMatch; onChangeAnswers: () => void }) {
  return (
    <aside
      aria-label="Why this coffee"
      className="bg-card mt-6 rounded-xl border p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          <CheckIcon /> Your match
        </Badge>
        <h3 className="text-[15px] font-semibold">
          {match.coffee.name}, {BAG_SIZES.find((s) => s.id === match.size)?.label},{" "}
          {GRINDS.find((g) => g.id === match.grind)?.label.toLowerCase()},{" "}
          {getCadence(match.cadence).short.toLowerCase()}
        </h3>
        <Button variant="outline" size="sm" className="ml-auto" onClick={onChangeAnswers}>
          Change my answers
        </Button>
      </div>
      <ul className="text-muted-foreground mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
        {match.reasons.map((reason) => (
          <li key={reason} className="flex gap-2">
            <CheckIcon className="text-primary mt-0.5 size-3.5 shrink-0" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ── the rest of the storefront ─────────────────────────────────────────────── */

export function CoffeeGrid({
  selectedId,
  matchedId,
  onSelect,
}: {
  selectedId: string;
  matchedId: string | null;
  onSelect: (coffeeId: string) => void;
}) {
  return (
    <section className="border-t py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">All five coffees</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Or ignore the quiz and pick one yourself — the buy box follows whatever you choose.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {COFFEES.map((coffee) => (
            <button
              key={coffee.id}
              type="button"
              onClick={() => onSelect(coffee.id)}
              aria-pressed={selectedId === coffee.id}
              className={cn(
                "bg-card focus-visible:ring-ring/50 rounded-xl border p-4 text-left transition-shadow focus-visible:ring-[3px] focus-visible:outline-none",
                selectedId === coffee.id ? "border-primary shadow-md" : "hover:shadow-sm",
              )}
            >
              <div className="bg-muted/40 mb-3 grid place-items-center rounded-lg py-3">
                <CoffeeBag coffee={coffee} className="text-foreground h-24 w-auto" />
              </div>
              {matchedId === coffee.id ? (
                <Badge className="mb-1.5">Your match</Badge>
              ) : null}
              <p className="text-sm font-medium">{coffee.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                {coffee.roast} · {coffee.notes[0]}
              </p>
              <p className="mt-2 text-sm font-semibold">{formatMoney(coffee.price)}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ValueStrip() {
  const items = [
    {
      icon: PackageIcon,
      title: "Roasted to order",
      body: "Nothing sits in a warehouse. Your bag is roasted the day it ships.",
    },
    {
      icon: TruckIcon,
      title: `Free over ${formatMoney(FREE_SHIPPING_OVER)}`,
      body: "US and EU, tracked. Two to four days depending on the border.",
    },
    {
      icon: RefreshCwIcon,
      title: "Cancel any time",
      body: "Subscriptions are 10% off and stop the moment you say so.",
    },
  ];

  return (
    <section className="bg-muted/30 border-t py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <span className="demo-brand-soft text-primary grid size-9 shrink-0 place-items-center rounded-lg">
              <item.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShopReviews() {
  const reviews = [
    {
      quote:
        "I have bought coffee online for six years and never once known what grind to ask for. Four clicks and it arrived right.",
      name: "Marta L.",
      place: "Rotterdam",
    },
    {
      quote:
        "The quiz put me on the dark roast, which I would never have picked off a shelf, and it is the first espresso my flatmate has not complained about.",
      name: "Dan R.",
      place: "Chicago",
    },
    {
      quote: "Two cups a day, 500 g a month. It just knew. The bag turns up the week it should.",
      name: "Priya S.",
      place: "Manchester",
    },
  ];

  return (
    <section className="border-t py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">What people say</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <figure key={review.name} className="bg-card rounded-xl border p-5">
              <div className="text-primary flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <StarIcon key={index} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed">{review.quote}</blockquote>
              <figcaption className="text-muted-foreground mt-3 text-xs">
                {review.name} — {review.place}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShopFooter() {
  return (
    <footer className="border-t py-10">
      <div className="text-muted-foreground mx-auto w-full max-w-6xl px-6 text-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-foreground font-semibold">Northmill Coffee</span>
          <span>Shipping</span>
          <span>Returns</span>
          <span>Wholesale</span>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed">
          Northmill Coffee is a fictional roaster invented for this demo. The catalogue, the
          prices, the reviews and the roastery do not exist, no order is ever placed and no
          payment is ever taken. The storefront is plain shadcn/ui; the quiz and the checkout
          are SurveyJS, styled only by the shadcn theme adapter.
        </p>
      </div>
    </footer>
  );
}

/* ── the cart ───────────────────────────────────────────────────────────────── */

export function CartLines({
  items,
  onQuantity,
  onRemove,
  onKeepShopping,
}: {
  items: readonly CartItem[];
  onQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  onKeepShopping: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-10 text-center shadow-sm">
        <ShoppingBagIcon className="text-muted-foreground mx-auto size-8" />
        <p className="mt-3 font-medium">Your cart is empty</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Take the five-question finder and we will fill it in for you.
        </p>
        <Button className="mt-4" onClick={onKeepShopping}>
          Back to the shop
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card divide-y rounded-xl border shadow-sm">
      {items.map((item) => {
        const coffee = getCoffee(item.coffeeId);
        const unit = priceFor(coffee, item.size);
        const cadence = getCadence(item.cadence);
        return (
          <div key={item.key} className="flex gap-4 p-4">
            <div className="bg-muted/40 grid size-20 shrink-0 place-items-center rounded-lg">
              <CoffeeBag coffee={coffee} className="text-foreground h-14 w-auto" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{coffee.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {GRINDS.find((g) => g.id === item.grind)?.label} ·{" "}
                    {BAG_SIZES.find((s) => s.id === item.size)?.label} · {cadence.short}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto"
                  aria-label={`Remove ${coffee.name}`}
                  onClick={() => onRemove(item.key)}
                >
                  <XIcon />
                </Button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`One fewer ${coffee.name}`}
                    onClick={() => onQuantity(item.key, item.quantity - 1)}
                  >
                    <MinusIcon />
                  </Button>
                  <span className="w-7 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`One more ${coffee.name}`}
                    onClick={() => onQuantity(item.key, item.quantity + 1)}
                  >
                    <PlusIcon />
                  </Button>
                </div>
                <span className="ml-auto text-sm font-semibold">
                  {formatMoney(Math.round(unit * item.quantity * 100) / 100)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrderSummary({
  items,
  shippingMethod,
  placed,
  onKeepShopping,
}: {
  items: readonly CartItem[];
  /** Straight out of the checkout survey's answers. */
  shippingMethod: unknown;
  placed: boolean;
  onKeepShopping: () => void;
}) {
  const totals: CartTotals = cartTotals(items, shippingMethod);

  return (
    <aside
      aria-label="Order summary"
      aria-live="polite"
      className="bg-card sticky top-24 rounded-xl border p-5 shadow-sm"
    >
      <h2 className="text-[15px] font-semibold">Order summary</h2>

      {placed ? (
        <div className="border-primary/40 bg-primary/5 mt-3 rounded-lg border p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <CheckIcon className="text-primary size-4" /> Order placed
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Nothing was charged — this is a demo of a fictional roaster.
          </p>
        </div>
      ) : null}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Subtotal · {totals.itemCount} {totals.itemCount === 1 ? "bag" : "bags"}
          </dt>
          <dd>{formatMoney(totals.subtotal)}</dd>
        </div>

        {totals.subscriptionDiscount > 0 ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subscription discount</dt>
            <dd className="text-primary">−{formatMoney(totals.subscriptionDiscount)}</dd>
          </div>
        ) : null}

        <div className="flex justify-between">
          <dt className="text-muted-foreground">{totals.shippingLabel}</dt>
          <dd>{totals.shipping === 0 ? "Free" : formatMoney(totals.shipping)}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated tax</dt>
          <dd>{formatMoney(totals.tax)}</dd>
        </div>

        <div className="flex justify-between border-t pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatMoney(totals.total)}</dd>
        </div>
      </dl>

      {totals.itemCount > 0 && totals.toFreeShipping > 0 ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {formatMoney(totals.toFreeShipping)} more for free standard shipping.
        </p>
      ) : null}

      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onKeepShopping}>
        Keep shopping
      </Button>
    </aside>
  );
}
