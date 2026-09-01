import {
  ArrowRightIcon,
  CheckIcon,
  MinusIcon,
  SparklesIcon,
} from "lucide-react";
import {
  CLOUD_MODULES,
  CLOUD_PLANS,
  formatUsd,
  type CloudQuote,
} from "@/schemas";
import { Button } from "@/components/ui/button";
import { SignedInChip } from "./SignedInChip";
import { accountText } from "./demo-accounts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * The pricing page of a fictional cloud data platform, "Cumulora".
 *
 * Unlike the Cadence site, this page is not a backdrop the survey sits on: it
 * reads the quote the configurator derives and re-prices itself — the plan cards
 * re-badge, the module grid marks what is in the quote, the comparison table
 * highlights a column. Everything here takes the quote as a prop and renders; the
 * demo component owns the state.
 *
 * Nothing here is a real company, and the footer says so.
 */

export const PRODUCT = "Cumulora";

export function CumuloraMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "demo-brand-bg text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none">
        <path
          d="M6.5 18h11a3.5 3.5 0 0 0 .3-6.99A5.5 5.5 0 0 0 7.6 9.2 3.9 3.9 0 0 0 6.5 18Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const NAV_LINKS = ["Platform", "Modules", "Pricing", "Docs", "Changelog"];

export function PricingHeader({
  onConfigure,
  account,
}: {
  onConfigure: () => void;
  /** The account record the configurator is being rendered for. */
  account: Record<string, unknown>;
}) {
  return (
    <header className="bg-background/70 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-6">
        <a href="#configure" className="flex items-center gap-2.5">
          <CumuloraMark />
          <span className="text-[15px] font-semibold tracking-tight">{PRODUCT}</span>
        </a>

        <nav aria-label={PRODUCT} className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#configure"
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SignedInChip
            account={account}
            meta={`${accountText(account, "companyName")} · ${accountText(
              account,
              "regionLabel",
            )}`}
          />
          <Button size="sm" className="demo-brand-bg hover:opacity-90" onClick={onConfigure}>
            Price it up
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * The heading above the configurator. Deliberately two lines and no more: the
 * form has to be on screen when the page opens, so the hero cannot take the fold.
 */
export function PricingIntro() {
  return (
    <div className="relative pt-10 pb-6 text-center">
      <div className="demo-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">
        <span className="demo-brand-soft inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <SparklesIcon className="size-3.5" />
          Usage-based, no annual lock-in
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          Price your data platform in <span className="demo-gradient-text">ninety seconds</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm">
          Answer as much as you know. The quote on the right updates as you go, and every
          answer stays editable.
        </p>
      </div>
    </div>
  );
}

/** The live quote — the half of the page that proves the survey is driving it. */
export function QuotePanel({
  quote,
  submitted,
  onSeePlan,
}: {
  quote: CloudQuote;
  submitted: boolean;
  onSeePlan: () => void;
}) {
  return (
    <aside
      aria-label="Your quote"
      aria-live="polite"
      className="bg-card rounded-xl border p-5 shadow-sm lg:sticky lg:top-24"
    >
      <p className="demo-brand-text text-xs font-semibold tracking-[0.18em] uppercase">
        Your quote
      </p>

      {!quote.started ? (
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Answer the first question and the price appears here, then keeps up with every
          change you make.
        </p>
      ) : (
        <>
          <p className="mt-3 text-2xl font-semibold tracking-tight">{quote.plan.name}</p>
          {quote.reasons.length > 0 && (
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              Because {quote.reasons.join(", and ")}.
            </p>
          )}

          <ul className="mt-5 flex flex-col gap-2.5">
            {quote.lines.map((line) => (
              <li key={line.label} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{line.label}</span>
                  {line.detail && (
                    <span className="text-muted-foreground block text-xs">{line.detail}</span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums">{formatUsd(line.amount)}</span>
              </li>
            ))}
            {quote.lines.length === 0 && (
              <li className="text-muted-foreground text-sm">
                Nothing billable yet — the free tier covers it.
              </li>
            )}
          </ul>

          <div className="mt-5 flex items-baseline justify-between gap-3 border-t pt-4">
            <span className="text-sm font-medium">
              {quote.quotedOnly ? "Add-ons per month" : "Per month"}
            </span>
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatUsd(quote.monthly)}
            </span>
          </div>

          {quote.quotedOnly && (
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
              The Enterprise platform fee is quoted rather than listed, so the total above
              covers only the add-ons you picked.
            </p>
          )}

          <Button
            className="demo-brand-bg mt-5 w-full gap-2 hover:opacity-90"
            onClick={onSeePlan}
          >
            {submitted ? "Back to my plan" : "See my plan"}
            <ArrowRightIcon />
          </Button>
        </>
      )}

      <p className="text-muted-foreground mt-4 text-[11px] leading-relaxed">
        An estimate for a product that does not exist. Nothing is sent anywhere.
      </p>
    </aside>
  );
}

export function PlanCards({
  quote,
  submitted,
  onChangeAnswers,
}: {
  quote: CloudQuote;
  submitted: boolean;
  onChangeAnswers: () => void;
}) {
  return (
    <section id="plans" className="scroll-mt-20 border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Four tiers</h2>
        <p className="text-muted-foreground mt-3 max-w-xl text-sm">
          Modules, compute and compliance are priced on top of whichever tier you land on.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLOUD_PLANS.map((plan) => {
            const recommended = quote.started && plan.id === quote.plan.id;
            return (
              <div
                key={plan.id}
                id={`plan-${plan.id}`}
                className={cn(
                  "bg-card relative flex scroll-mt-24 flex-col rounded-xl border p-5 transition-shadow",
                  recommended && "border-transparent shadow-lg",
                )}
                style={recommended ? { boxShadow: "0 0 0 2px var(--demo-brand)" } : undefined}
              >
                {recommended && (
                  <span className="demo-brand-bg text-primary-foreground absolute -top-3 left-5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                    Recommended for you
                  </span>
                )}
                <p className="text-sm font-medium">{plan.name}</p>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tracking-tight">
                    {plan.price === null ? "Custom" : formatUsd(plan.price)}
                  </span>
                  {plan.price !== null && (
                    <span className="text-muted-foreground text-xs">/ month</span>
                  )}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {plan.tagline}
                </p>

                <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                  <PlanFact
                    label={
                      plan.projects === null
                        ? "Unlimited projects"
                        : `${plan.projects} project${plan.projects === 1 ? "" : "s"}`
                    }
                  />
                  <PlanFact
                    label={
                      plan.storageGb === null
                        ? "Storage to suit"
                        : `${plan.storageGb.toLocaleString("en-US")} GB included`
                    }
                  />
                  <PlanFact label={plan.support} />
                  <PlanFact label="SSO and audit log" available={plan.sso} />
                  <PlanFact label="Self-hosted option" available={plan.selfHost} />
                </ul>

                {recommended ? (
                  <div className="mt-5 flex flex-col gap-2">
                    <p className="text-sm font-medium tabular-nums">
                      {quote.quotedOnly
                        ? `${formatUsd(quote.monthly)} of add-ons, platform quoted`
                        : `${formatUsd(quote.monthly)} a month all in`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={onChangeAnswers}
                    >
                      {submitted ? "Change my answers" : "Back to the questions"}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="mt-5 w-full">
                    {plan.price === null ? "Book a call" : "Start free"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlanFact({ label, available = true }: { label: string; available?: boolean }) {
  return (
    <li
      className={cn(
        "flex items-start gap-2",
        available ? "text-muted-foreground" : "text-muted-foreground/50",
      )}
    >
      {available ? (
        <CheckIcon className="demo-brand-text mt-0.5 size-4 shrink-0" />
      ) : (
        <MinusIcon className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{label}</span>
    </li>
  );
}

export function ModuleGrid({ selectedIds }: { selectedIds: readonly string[] }) {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Modules</h2>
        <p className="text-muted-foreground mt-3 max-w-xl text-sm">
          Switched on per project, billed monthly, removable at any time. Whatever you picked
          in the configurator is marked here.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CLOUD_MODULES.map((entry) => {
            const inQuote = selectedIds.includes(entry.id);
            return (
              <div
                key={entry.id}
                className={cn(
                  "bg-card flex flex-col rounded-xl border p-5",
                  inQuote && "border-transparent",
                )}
                style={inQuote ? { boxShadow: "0 0 0 2px var(--demo-brand)" } : undefined}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-medium">{entry.name}</span>
                  <span className="text-xs tabular-nums">{formatUsd(entry.price)}/mo</span>
                </span>
                <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                  {entry.blurb}
                </p>
                <span
                  className={cn(
                    "mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    inQuote ? "demo-brand-soft" : "text-muted-foreground bg-secondary",
                  )}
                >
                  {inQuote ? (
                    <>
                      <CheckIcon className="size-3" />
                      In your quote
                    </>
                  ) : (
                    "Not selected"
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const COMPARISON_ROWS: readonly {
  label: string;
  value: (plan: (typeof CLOUD_PLANS)[number]) => string;
}[] = [
  {
    label: "Projects",
    value: (plan) => (plan.projects === null ? "Unlimited" : String(plan.projects)),
  },
  {
    label: "Storage included",
    value: (plan) =>
      plan.storageGb === null ? "To suit" : `${plan.storageGb.toLocaleString("en-US")} GB`,
  },
  { label: "Support", value: (plan) => plan.support },
  { label: "SSO and audit log", value: (plan) => (plan.sso ? "Included" : "—") },
  { label: "Self-hosted", value: (plan) => (plan.selfHost ? "Available" : "—") },
  { label: "All four modules", value: () => "Available" },
  {
    label: "EU data residency",
    value: (plan) => (plan.id === "sandbox" ? "—" : "Add-on"),
  },
];

export function ComparisonTable({ quote }: { quote: CloudQuote }) {
  return (
    <section className="bg-muted/30 border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Side by side
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl text-sm">
          Your recommended tier is highlighted as you answer.
        </p>

        <div className="mt-8 overflow-x-auto">
          <Table className="bg-card min-w-[42rem] rounded-xl border">
            <TableHeader>
              <TableRow>
                <TableHead className="w-56">Capability</TableHead>
                {CLOUD_PLANS.map((plan) => {
                  const recommended = quote.started && plan.id === quote.plan.id;
                  return (
                    <TableHead
                      key={plan.id}
                      className={cn(recommended && "demo-brand-soft font-semibold")}
                    >
                      {plan.name}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_ROWS.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  {CLOUD_PLANS.map((plan) => {
                    const recommended = quote.started && plan.id === quote.plan.id;
                    return (
                      <TableCell
                        key={plan.id}
                        className={cn(
                          "text-muted-foreground",
                          recommended && "demo-brand-soft",
                        )}
                      >
                        {row.value(plan)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    question: "Is the estimate binding?",
    answer:
      "No — and neither is the product, which we invented for this demo. On a real site this is where you would say what the quote commits you to.",
  },
  {
    question: "How is compute billed?",
    answer:
      "Per environment, per month, by size. Add or remove environments in the configurator and the compute line follows immediately.",
  },
  {
    question: "What happens past my storage allowance?",
    answer:
      "Overage is billed per GB rather than bumping you to the next tier. The quote shows it as its own line so you can see it happen.",
  },
  {
    question: "Can I change an answer after seeing the price?",
    answer:
      "Yes. The review step before the result lets you edit any answer, and the plan card takes you back to the questions with everything you typed still there.",
  },
];

export function PricingFaq() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Questions we get
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question}>
              <p className="text-sm font-medium">{item.question}</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingFooter() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2.5">
          <CumuloraMark />
          <span className="text-sm font-semibold tracking-tight">{PRODUCT}</span>
        </span>
        <p className="text-muted-foreground">
          © 2026 Cumulora — a fictional company invented for this demo.
        </p>
        <p className="text-muted-foreground">
          The page is a mock. The configurator is a real{" "}
          <a
            href="https://surveyjs.io/form-library"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            SurveyJS
          </a>{" "}
          form.
        </p>
      </div>
    </footer>
  );
}
