"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardListIcon,
  HeartPulseIcon,
  LayersIcon,
  SquareArrowOutUpRightIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";

/**
 * The clinic's back office — the plainest possible one, on purpose.
 *
 * A reviewer opening this link should recognise the furniture before reading a
 * word: a fixed top bar, a sidebar of two sections, a content area. Nothing here
 * is a SurveyJS feature. What is worth noticing is that both sections *are*
 * SurveyJS — the patient chart is a survey, and the appointment form is the JSON
 * next to its own preview — and that this is the practice's admin, not a demo
 * harness: the public website is one click away, rendered from what is saved
 * here.
 */
interface AdminNavItem {
  readonly href: string;
  readonly label: string;
  readonly hint: string;
  readonly icon: LucideIcon;
}

const NAV: readonly AdminNavItem[] = [
  {
    href: "/clinic-admin/patients",
    label: "Patients",
    hint: "Charts, coverage and history",
    icon: UsersRoundIcon,
  },
  {
    href: "/clinic-admin",
    label: "Appointment Form",
    hint: "The form on the website",
    icon: ClipboardListIcon,
  },
];

const SIDEBAR_WIDTH = "16rem";
/** The practice's public page — what the portal is maintaining. */
const SITE_URL = "/embedded/clinic";

export function ClinicAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-muted/30 text-foreground flex h-svh min-h-svh flex-col">
      <header className="bg-background sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <span className="flex min-w-0 items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
            <HeartPulseIcon className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">
              Ridgeline Admin Portal
            </span>
            <span className="text-muted-foreground truncate text-[11px]">
              Ridgeline Family Health
            </span>
          </span>
        </span>

        {/* Said out loud, on every screen: the practice, the portal and the
            website are a demo of the library. What is for sale is SurveyJS. */}
        <a
          href="/claims"
          className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 focus-visible:ring-ring/50 ml-1 flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
          title="Every screen here is built with the SurveyJS Library — see the other demos"
        >
          <LayersIcon className="size-3.5" />
          SurveyJS demos
        </a>

        <div className="ml-auto flex items-center gap-3">
          {/* Who is looking: a member of clinic staff, not the patient. Every
              screen behind this bar is staff-side, and the personalisation the
              website does is for somebody else entirely. */}
          <span className="flex items-center gap-2">
            <span className="flex flex-col text-right leading-tight">
              <span className="text-xs font-medium">Content Manager</span>
              <span className="text-muted-foreground text-[11px]">Signed in</span>
            </span>
            <span
              className="bg-secondary text-secondary-foreground flex size-8 items-center justify-center rounded-full text-[11px] font-semibold"
              aria-hidden
            >
              CM
            </span>
          </span>
          <ThemeSwitcher />

          {/* The way out of the back office and onto the public site, in the
              corner of every section rather than repeated inside them. */}
          <Button size="sm" className="gap-1.5" asChild>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noreferrer"
              title="Open the patient-facing website, rendered from what is saved here"
            >
              Preview
              <SquareArrowOutUpRightIcon />
            </a>
          </Button>
        </div>
      </header>

      {/* The sidebar collapses to a row of tabs rather than a drawer: two
          sections do not earn a hamburger. */}
      <nav
        aria-label="Practice admin"
        className="bg-background flex shrink-0 gap-1 border-b px-3 py-2 lg:hidden"
      >
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1" style={{ height: 0 }}>
        <aside
          className="bg-background hidden h-full shrink-0 overflow-y-auto border-r lg:block"
          style={{ width: SIDEBAR_WIDTH }}
        >
          <nav aria-label="Practice admin" className="flex flex-col gap-1 p-3">
            {NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/50 flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground text-xs leading-tight">
                      {item.hint}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="flex h-full w-full flex-col px-4 py-4 sm:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
