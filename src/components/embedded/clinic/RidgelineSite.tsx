"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ActivityIcon,
  BabyIcon,
  BrainIcon,
  CalendarCheckIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  HeartPulseIcon,
  LanguagesIcon,
  MapPinIcon,
  MoonIcon,
  PhoneIcon,
  PrinterIcon,
  ShieldCheckIcon,
  StethoscopeIcon,
  SunIcon,
  TriangleAlertIcon,
  UserRoundIcon,
  VideoIcon,
} from "lucide-react";
import {
  CLINIC_LOCATIONS,
  CLINIC_SERVICES,
  HEALTH_PLANS,
  PROVIDERS,
  SELF_PAY_PRICES,
  formatDollars,
  type VisitSummary,
} from "@/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignedInChip } from "../shared/SignedInChip";
import { accountText } from "../shared/demo-accounts";
import { mergeTailwindClasses } from "@/lib/utils";

/**
 * Ridgeline Family Health — a fictional US primary-care group.
 *
 * Built to the conventions an American patient reads without thinking: a utility
 * bar with the phone number and the patient portal, "most major plans accepted",
 * a provider directory with credentials and board certifications, posted self-pay
 * prices, and a footer carrying the notices a real practice is obliged to carry.
 * Those details are the demo: a SurveyJS form has to look at home on a page like
 * this one, not on a page built to flatter it.
 *
 * Plain shadcn surfaces throughout — no bespoke CSS, and nothing here touches an
 * `.sd-` class. No photographs either, so the demo carries no image licences.
 */

const SERVICE_ICONS = [
  StethoscopeIcon,
  BabyIcon,
  HeartPulseIcon,
  BrainIcon,
  ActivityIcon,
  ShieldCheckIcon,
];

/* ── chrome ─────────────────────────────────────────────────────────────────── */

/**
 * Light and dark, where a real site puts it: in its own utility bar.
 *
 * It is not a demo control — every visitor expects a site to have one — so it
 * belongs to the host page rather than to the reviewer's toolbar. The label only
 * appears once mounted, because the server has no way to know which scheme the
 * browser will resolve.
 */
function SchemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="hover:text-foreground focus-visible:ring-ring/50 flex items-center gap-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <MoonIcon className="size-3.5" /> : <SunIcon className="size-3.5" />}
      {isDark ? "Dark" : "Light"}
    </button>
  );
}

export function ClinicUtilityBar() {
  return (
    <div className="bg-muted/50 border-b text-xs">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-6 py-2">
        <span className="text-foreground flex items-center gap-1.5 font-medium">
          <PhoneIcon className="size-3.5" /> (503) 555-0148
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="size-3.5" /> Urgent care until 8:00 pm daily
        </span>
        <span className="ml-auto flex items-center gap-x-5">
          <span className="flex items-center gap-1.5">
            <LanguagesIcon className="size-3.5" /> Español
          </span>
          <span>Pay my bill</span>
          <span className="text-foreground font-medium">Patient portal</span>
          <SchemeToggle />
        </span>
      </div>
    </div>
  );
}

export function ClinicHeader({
  onRequest,
  account,
}: {
  onRequest: () => void;
  /** The patient whose portal record the form is rendered from. */
  account: Record<string, unknown>;
}) {
  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="demo-brand-bg text-primary-foreground grid size-9 place-items-center rounded-lg">
            <HeartPulseIcon className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight">Ridgeline</span>
            <span className="text-muted-foreground block text-[11px]">Family Health</span>
          </span>
        </div>

        <nav className="text-muted-foreground hidden items-center gap-6 text-sm lg:flex">
          <span className="text-foreground font-medium">Services</span>
          <span>Providers</span>
          <span>Locations</span>
          <span>Patients</span>
          <span>Insurance &amp; billing</span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SignedInChip
            account={account}
            meta={
              accountText(account, "mrn")
                ? `MRN ${accountText(account, "mrn")} · ${accountText(
                    account,
                    "healthPlanLabel",
                    "no plan on file",
                  )}`
                : undefined
            }
          />
          <Button size="sm" onClick={onRequest}>
            <CalendarCheckIcon />
            Request an appointment
          </Button>
        </div>
      </div>
    </header>
  );
}

export function ClinicIntro() {
  return (
    <div className="pt-10 pb-8">
      <Badge variant="outline" className="mb-4">
        <CheckIcon /> Accepting new patients at all three offices
      </Badge>
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Primary care that answers the phone, and{" "}
        <span className="demo-gradient-text">tells you the price</span>
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-[15px]">
        Same-week appointments with a clinician who keeps your chart. In network with most major
        plans, with posted self-pay prices if you would rather skip insurance altogether. Request
        a visit below — a scheduler calls you back the same business day.
      </p>
      <dl className="text-muted-foreground mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div>
          <dt className="text-foreground font-semibold">3 offices</dt>
          <dd>Portland and Beaverton</dd>
        </div>
        <div>
          <dt className="text-foreground font-semibold">Same-day labs</dt>
          <dd>Drawn and read on site</dd>
        </div>
        <div>
          <dt className="text-foreground font-semibold">Under 12 min</dt>
          <dd>Median wait past appointment time</dd>
        </div>
      </dl>
    </div>
  );
}

/* ── the live panel ─────────────────────────────────────────────────────────── */

export function VisitSummaryPanel({
  summary,
  submitted,
  onChangeAnswers,
}: {
  summary: VisitSummary;
  submitted: boolean;
  onChangeAnswers: () => void;
}) {
  return (
    <aside
      aria-label="Your visit"
      aria-live="polite"
      className="bg-card sticky top-24 rounded-xl border p-5 shadow-sm"
    >
      <h2 className="text-[15px] font-semibold">Your visit</h2>

      {!summary.started ? (
        <p className="text-muted-foreground mt-2 text-sm">
          Answer the first question and this fills in — what it costs you, where you are going and
          what to bring.
        </p>
      ) : (
        <>
          {submitted ? (
            <div className="border-primary/40 bg-primary/5 mt-3 rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <CheckIcon className="text-primary size-4" /> Request received
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                A scheduler calls you back the same business day. Nothing was really sent — this
                clinic is fictional.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={onChangeAnswers}>
                Change my answers
              </Button>
            </div>
          ) : null}

          <div className="mt-4 space-y-3 text-sm">
            {summary.reason ? (
              <Row icon={StethoscopeIcon} label="Reason" value={summary.reason.label} />
            ) : null}
            {summary.location ? (
              <Row
                icon={MapPinIcon}
                label="Office"
                value={`${summary.location.name} — ${summary.location.address1}, ${summary.location.city}`}
              />
            ) : null}
            <Row
              icon={UserRoundIcon}
              label="Clinician"
              value={
                summary.provider
                  ? `${summary.provider.name}, ${summary.provider.credential}`
                  : "First available"
              }
            />
            <Row icon={ClockIcon} label="When" value={summary.whenText} />
            {summary.newPatient ? (
              <Row icon={FileTextIcon} label="Patient" value="New to Ridgeline" />
            ) : null}
          </div>

          {summary.estimate !== null ? (
            <div className="bg-muted/40 mt-4 rounded-lg border p-4">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {summary.selfPay ? "Self-pay price" : "Estimated due at check-in"}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {formatDollars(summary.estimate)}
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {summary.estimateLabel}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-4 text-xs">{summary.estimateLabel}</p>
          )}

          {summary.referralNeeded ? (
            <p className="border-destructive/40 bg-destructive/5 mt-3 flex gap-2 rounded-lg border p-3 text-xs leading-relaxed">
              <TriangleAlertIcon className="text-destructive mt-0.5 size-4 shrink-0" />
              <span>
                {summary.plan?.name} needs a referral from your assigned primary-care clinician for
                this kind of visit. We can request one for you — say so when the scheduler calls.
              </span>
            </p>
          ) : null}

          {summary.urgent ? (
            <p className="border-primary/40 bg-primary/5 mt-3 flex gap-2 rounded-lg border p-3 text-xs leading-relaxed">
              <ClockIcon className="text-primary mt-0.5 size-4 shrink-0" />
              <span>
                Walk-in urgent care at Cedar Park is open until 8:00 pm today. If this cannot wait
                for a callback, come in.
              </span>
            </p>
          ) : null}

          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium tracking-wide uppercase">What to bring</p>
            <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
              {summary.bring.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckIcon className="text-primary mt-0.5 size-3.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </aside>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof StethoscopeIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="leading-snug">{value}</p>
      </div>
    </div>
  );
}

/* ── the rest of the site ───────────────────────────────────────────────────── */

export function ServiceGrid() {
  return (
    <section className="border-t py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">What we do here</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Everything below happens at Cedar Park. The other two offices carry a subset.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CLINIC_SERVICES.map((service, index) => {
            const Icon = SERVICE_ICONS[index] ?? StethoscopeIcon;
            return (
              <div key={service.id} className="bg-card rounded-xl border p-5">
                <span className="demo-brand-soft text-primary mb-3 grid size-9 place-items-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                <h3 className="text-[15px] font-semibold">{service.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                  {service.blurb}
                </p>
                <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2">
                      <CheckIcon className="text-primary mt-0.5 size-3.5 shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function ProviderDirectory({ selectedId }: { selectedId: string | null }) {
  return (
    <section className="bg-muted/30 border-t py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">Our clinicians</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Pick one in the form and we hold their schedule; leave it on &ldquo;first
          available&rdquo; and you will usually be seen sooner.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              id={`provider-${provider.id}`}
              className={mergeTailwindClasses(
                "bg-card scroll-mt-24 rounded-xl border p-5 transition-shadow",
                selectedId === provider.id ? "border-primary shadow-md" : "",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="demo-brand-soft text-primary grid size-11 shrink-0 place-items-center rounded-full text-sm font-semibold">
                  {initials(provider.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-tight font-semibold">
                    {provider.name}, {provider.credential}
                  </p>
                  <p className="text-muted-foreground text-sm">{provider.specialty}</p>
                </div>
              </div>

              {selectedId === provider.id ? (
                <Badge className="mt-3">
                  <CheckIcon /> Requested
                </Badge>
              ) : null}

              <dl className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="shrink-0">Board certified</dt>
                  <dd className="text-foreground">{provider.boardCertified}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0">Languages</dt>
                  <dd className="text-foreground">{provider.languages.join(", ")}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0">New patients</dt>
                  <dd className="text-foreground">
                    {provider.acceptingNew ? "Accepting" : "Established patients only"}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LocationCards({ selectedId }: { selectedId: string | null }) {
  return (
    <section className="border-t py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">Offices and hours</h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {CLINIC_LOCATIONS.map((location) => (
            <div
              key={location.id}
              id={`location-${location.id}`}
              className={mergeTailwindClasses(
                "bg-card scroll-mt-24 rounded-xl border p-5 transition-shadow",
                selectedId === location.id ? "border-primary shadow-md" : "",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-semibold">Ridgeline {location.name}</h3>
                {selectedId === location.id ? <Badge>Chosen</Badge> : null}
              </div>

              <address className="text-muted-foreground mt-2 text-sm not-italic">
                {location.address1}
                {location.address2 ? (
                  <>
                    <br />
                    {location.address2}
                  </>
                ) : null}
                <br />
                {location.city}, {location.state} {location.zip}
              </address>

              <div className="text-muted-foreground mt-3 space-y-1 text-sm">
                <p className="flex items-center gap-1.5">
                  <PhoneIcon className="size-3.5" /> {location.phone}
                </p>
                <p className="flex items-center gap-1.5">
                  <PrinterIcon className="size-3.5" /> {location.fax}
                </p>
              </div>

              <dl className="mt-3 space-y-1 border-t pt-3 text-sm">
                {location.hours.map((entry) => (
                  <div key={entry.days} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{entry.days}</dt>
                    <dd>{entry.time}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
                {location.notes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CoverageSection({ summary }: { summary: VisitSummary }) {
  return (
    <section className="bg-muted/30 border-t py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Insurance we take</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            In network, with no facility fee. If your plan is not listed, call us — we will check
            before you come in.
          </p>

          <ul className="mt-5 space-y-2">
            {HEALTH_PLANS.map((plan) => (
              <li
                key={plan.id}
                className={mergeTailwindClasses(
                  "bg-card flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 text-sm",
                  summary.plan?.id === plan.id ? "border-primary shadow-sm" : "",
                )}
              >
                <CreditCardIcon className="text-muted-foreground size-4" />
                <span className="font-medium">{plan.name}</span>
                {summary.plan?.id === plan.id ? <Badge>Yours</Badge> : null}
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatDollars(plan.copayPrimary)} primary ·{" "}
                  {formatDollars(plan.copaySpecialist)} specialist
                  {plan.referralRequired ? " · referral needed" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">Self-pay prices</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            The same for everyone, posted up front, due at check-in. No claim, no surprise bill six
            weeks later.
          </p>

          <div className="bg-card mt-5 divide-y rounded-xl border">
            {SELF_PAY_PRICES.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm">{entry.label}</span>
                <span className="text-sm font-semibold">{formatDollars(entry.price)}</span>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground mt-4 flex gap-2 text-xs leading-relaxed">
            <ShieldCheckIcon className="mt-0.5 size-4 shrink-0" />
            <span>
              Under the No Surprises Act you are entitled to a good-faith estimate in writing
              before a scheduled visit. Ask for one and we will send it with your confirmation.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function NewPatientSection({ onRequest }: { onRequest: () => void }) {
  const steps = [
    {
      icon: CalendarCheckIcon,
      title: "Request a time",
      body: "Use the form on this page. A scheduler calls you back the same business day to confirm.",
    },
    {
      icon: FileTextIcon,
      title: "Fill in your history",
      body: "We send an intake form by text. It takes about ten minutes and saves you the clipboard.",
    },
    {
      icon: VideoIcon,
      title: "Come in, or don't",
      body: "Plenty of first visits work as a video call. We will tell you honestly which yours is.",
    },
  ];

  return (
    <section className="border-t py-14">
      <div className="mx-auto w-full max-w-6xl px-6">
        <h2 className="text-xl font-semibold tracking-tight">New here?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-card rounded-xl border p-5">
              <div className="flex items-center gap-2">
                <span className="demo-brand-soft text-primary grid size-8 place-items-center rounded-lg text-xs font-semibold">
                  {index + 1}
                </span>
                <step.icon className="text-muted-foreground size-4" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="bg-card mt-6 flex flex-wrap items-center gap-4 rounded-xl border p-5">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">Ready when you are</p>
            <p className="text-muted-foreground text-sm">
              Requests submitted before 4:00 pm get a callback the same day.
            </p>
          </div>
          <Button className="ml-auto" onClick={onRequest}>
            <CalendarCheckIcon />
            Request an appointment
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ClinicFooter() {
  return (
    <footer className="bg-muted/30 border-t py-10">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="demo-brand-bg text-primary-foreground grid size-7 place-items-center rounded-md">
                <HeartPulseIcon className="size-4" />
              </span>
              <span className="text-sm font-semibold">Ridgeline Family Health</span>
            </div>
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              1180 Cedar Park Boulevard, Suite 210
              <br />
              Portland, OR 97214
              <br />
              (503) 555-0148 · TTY 711
            </p>
          </div>

          <div className="text-muted-foreground text-xs">
            <p className="text-foreground font-medium">Patients</p>
            <ul className="mt-2 space-y-1.5">
              <li>Patient portal</li>
              <li>Pay my bill</li>
              <li>Request records</li>
              <li>Prescription refills</li>
            </ul>
          </div>

          <div className="text-muted-foreground text-xs">
            <p className="text-foreground font-medium">Notices</p>
            <ul className="mt-2 space-y-1.5">
              <li>Notice of Privacy Practices</li>
              <li>Nondiscrimination notice</li>
              <li>Accessibility statement</li>
              <li>Your rights under the No Surprises Act</li>
            </ul>
          </div>

          <div className="text-muted-foreground text-xs">
            <p className="text-foreground font-medium">Language assistance</p>
            <p className="mt-2 leading-relaxed">
              Interpretation is free of charge in any language, in person or by phone. Ask when the
              scheduler calls, or tick the box in the form.
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mt-8 border-t pt-6 text-xs leading-relaxed">
          Ridgeline Family Health is a fictional clinic built to demonstrate SurveyJS inside a
          realistic healthcare page. The clinicians, offices, phone numbers, insurance plans and
          prices are invented; nothing on this page is medical advice, no appointment is booked and
          no data leaves your browser. The page is plain shadcn/ui; the forms are SurveyJS, styled
          only by the shadcn theme adapter.
        </p>
      </div>
    </footer>
  );
}
