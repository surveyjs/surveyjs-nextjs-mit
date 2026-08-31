"use client";

import { useCallback, useMemo, useState } from "react";
import { matchCoffee, type CartItem, type SurveyData } from "@/schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DemoDock } from "./DemoDock";
import { OverlayPlacements, PlacementCallout } from "./DemoPlacements";
import { EmbeddedSurvey, SurveyCard } from "./EmbeddedSurvey";
import { SurveyJsonPanel } from "./SurveyJsonPanel";
import {
  CartLines,
  CoffeeGrid,
  MatchNote,
  OrderSummary,
  ProductPanel,
  ShopFooter,
  ShopHeader,
  ShopIntro,
  ShopReviews,
  ValueStrip,
  type Selection,
} from "./NorthmillShop";
import { useDemoChrome } from "./useDemoChrome";
import type { DemoSurvey } from "./demo-controls";

const ANCHOR = "embedded-survey";
const FINDER_ID = "coffee-finder";
const CHECKOUT_ID = "checkout";
export const NORTHMILL_BRAND = "amber";
const BRAND = NORTHMILL_BRAND;

const DEFAULT_SELECTION: Selection = {
  coffeeId: "cedar",
  grind: "whole",
  size: "250g",
  cadence: "oneOff",
  quantity: 1,
};

/**
 * Embedded demo: a storefront where the survey chooses the product.
 *
 * The two definitions this demo carries are the two most familiar forms on the
 * internet, and the toolbar's switcher genuinely moves between the store's two
 * pages rather than swapping one form for another in the same slot:
 *
 *  - **Coffee finder** — five one-click questions on the product page. Every
 *    answer re-points the buy box: which bag is on sale, its grind, its size and
 *    how often it arrives. This is the mechanic the whole demo exists for, and it
 *    is the one a merchandiser recognises instantly.
 *  - **Checkout** — the cart. The order summary is downstream of the form, so
 *    picking Overnight on the Shipping step moves the total in the sidebar while
 *    the form is still open.
 *
 * Worth showing in a presentation, in this order: Prefill on the finder (the
 * product changes under you), Add to cart (you land in the cart), then change
 * the shipping method and watch the total. Then move the form into the side
 * drawer from the toolbar and do it again — the page keeps up either way.
 */
export function NorthmillDemo({ surveys }: { surveys: readonly DemoSurvey[] }) {
  const chrome = useDemoChrome({ surveys, anchorId: ANCHOR, brandId: BRAND });

  const view = chrome.activeSurvey.id === CHECKOUT_ID ? "cart" : "shop";

  const [selection, setSelection] = useState<Selection>(DEFAULT_SELECTION);
  const [quizData, setQuizData] = useState<SurveyData>({});
  const [checkoutData, setCheckoutData] = useState<SurveyData>({});
  const [items, setItems] = useState<readonly CartItem[]>([]);
  const [placed, setPlaced] = useState(false);

  const match = useMemo(() => matchCoffee(quizData), [quizData]);

  /**
   * The quiz is the more specific act, so its answers win over a manual pick —
   * answering a question always re-points the buy box, and a manual override
   * stands only until the next answer.
   */
  const handleQuizData = useCallback((next: SurveyData) => {
    setQuizData(next);
    const result = matchCoffee(next);
    if (!result.started) {
      setSelection(DEFAULT_SELECTION);
      return;
    }
    setSelection((current) => ({
      coffeeId: result.coffee.id,
      grind: result.grind,
      size: result.size,
      cadence: result.cadence,
      quantity: current.quantity,
    }));
  }, []);

  const handleQuizComplete = useCallback(() => {
    requestAnimationFrame(() =>
      document.getElementById("product")?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, []);

  const handleCheckoutData = useCallback((next: SurveyData) => setCheckoutData(next), []);

  const handleCheckoutComplete = useCallback((next: SurveyData) => {
    setCheckoutData(next);
    setPlaced(true);
  }, []);

  const goShop = useCallback(() => {
    if (chrome.activeSurvey.id === FINDER_ID) chrome.requestSurvey();
    else chrome.selectSurvey(FINDER_ID);
  }, [chrome]);

  const goCart = useCallback(() => {
    if (chrome.activeSurvey.id === CHECKOUT_ID) chrome.requestSurvey();
    else chrome.selectSurvey(CHECKOUT_ID);
  }, [chrome]);

  const addToCart = useCallback(() => {
    const key = `${selection.coffeeId}-${selection.grind}-${selection.size}-${selection.cadence}`;
    setPlaced(false);
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + selection.quantity } : item,
        );
      }
      return [...current, { key, ...selection }];
    });
    goCart();
  }, [selection, goCart]);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const changeAnswers = useCallback(() => {
    chrome.resumeWith(quizData);
  }, [chrome, quizData]);

  const isCheckout = view === "cart";

  const survey = (
    <EmbeddedSurvey
      key={chrome.runKey}
      json={chrome.json}
      data={chrome.seed}
      onDataChange={isCheckout ? handleCheckoutData : handleQuizData}
      onComplete={isCheckout ? handleCheckoutComplete : handleQuizComplete}
    />
  );

  const inline = chrome.placement === "inline";

  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <ShopHeader
        cartCount={items.reduce((count, item) => count + item.quantity, 0)}
        onCart={goCart}
        onShop={goShop}
        onFinder={goShop}
        view={view}
      />

      <main className="flex-1">
        {isCheckout ? (
          <section className="mx-auto w-full max-w-6xl px-6 pt-10 pb-16">
            <h1 className="text-2xl font-semibold tracking-tight">Your cart</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {items.length === 0
                ? "Nothing in it yet."
                : "Everything below was put here by the finder — grind, size and schedule included."}
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="min-w-0 space-y-6">
                <CartLines
                  items={items}
                  onQuantity={setQuantity}
                  onRemove={removeItem}
                  onKeepShopping={goShop}
                />

                <div id={ANCHOR} className="scroll-mt-24">
                  {inline ? (
                    <SurveyCard>{survey}</SurveyCard>
                  ) : (
                    <PlacementCallout
                      placement={chrome.placement}
                      title="Checkout"
                      onOpen={() => chrome.setOverlayOpen(true)}
                    />
                  )}
                </div>
              </div>

              <OrderSummary
                items={items}
                shippingMethod={checkoutData.shippingMethod}
                placed={placed}
                onKeepShopping={goShop}
              />
            </div>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden">
              <div className="demo-grid pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative mx-auto w-full max-w-6xl px-6 pb-14">
                <ShopIntro />

                {/* Product left, quiz right: the survey is above the fold, beside
                    the thing it is choosing, which is the only arrangement in
                    which a visitor understands what the questions are for. */}
                <div
                  className={cn(
                    "grid gap-8",
                    inline
                      ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
                      : "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]",
                  )}
                >
                  <div className="min-w-0">
                    <ProductPanel
                      selection={selection}
                      onSelectionChange={setSelection}
                      onAddToCart={addToCart}
                      matched={match.started}
                      match={match}
                    />
                    {match.started && match.reasons.length > 0 ? (
                      <MatchNote match={match} onChangeAnswers={changeAnswers} />
                    ) : null}
                  </div>

                  <div id={ANCHOR} className="min-w-0 scroll-mt-24">
                    {inline ? (
                      <SurveyCard>{survey}</SurveyCard>
                    ) : (
                      <PlacementCallout
                        placement={chrome.placement}
                        title="Find your coffee"
                        onOpen={() => chrome.setOverlayOpen(true)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <CoffeeGrid
              selectedId={selection.coffeeId}
              matchedId={match.started ? match.coffee.id : null}
              onSelect={(coffeeId) =>
                setSelection((current) => ({ ...current, coffeeId }))
              }
            />
            <ValueStrip />
            <ShopReviews />

            <section className="border-t py-14">
              <div className="mx-auto w-full max-w-6xl px-6 text-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  Still not sure which bag?
                </h2>
                <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
                  Five questions, about twenty seconds, and you never have to read the word
                  &ldquo;washed&rdquo; again.
                </p>
                <Button className="mt-5" onClick={goShop}>
                  Find your coffee
                </Button>
              </div>
            </section>
          </>
        )}
      </main>

      <ShopFooter />

      <OverlayPlacements
        placement={chrome.placement}
        open={chrome.overlayOpen}
        onOpenChange={chrome.setOverlayOpen}
        label={chrome.activeSurvey.label}
      >
        {survey}
      </OverlayPlacements>

      <SurveyJsonPanel {...chrome.jsonPanelProps} />
      <DemoDock {...chrome.dockProps} />
    </div>
  );
}
