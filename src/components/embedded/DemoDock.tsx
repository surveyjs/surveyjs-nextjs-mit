"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ChevronDownIcon,
  Code2Icon,
  LayersIcon,
  MoonIcon,
  RotateCcwIcon,
  SquareDashedIcon,
  SunIcon,
  UserRoundIcon,
  UsersRoundIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Where the demos came from — the template's own admin shell. */
const HOME = "/claims";

/**
 * The reviewer's toolbar, floating over the mock site.
 *
 * Every control exists to make a single claim checkable:
 *
 *  - **the way back to the admin** — the form is a JSON document, and it is
 *    maintained in a back office rather than in the page it is embedded in. What
 *    is saved there is what this page renders, which is the round trip a buyer is
 *    asking about;
 *  - **Prefill / Reset** — so the rest can be shown on a filled form at once;
 *  - **Login as** — the people the back office keeps. The same definition, a
 *    different person, and the form changes shape. Nothing is editable here on
 *    purpose: on the public site a visitor is who they are signed in as. Demos
 *    without a back office of their own instead get an *Edit the user* popup,
 *    whose editor is a SurveyJS survey;
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
  onEditUser,
  adminHref,
  adminLabel,
  users,
  activeUserId,
  onSelectUser,
  edited,
  userOpen,
  showTheme = true,
}: {
  highlight: boolean;
  onToggleHighlight: () => void;
  onPrefill: () => void;
  onReset: () => void;
  /** Absent where a back office owns the record — then the dropdown is all. */
  onEditUser?: () => void;
  /** Where this form is maintained, and what the button says. */
  adminHref: string;
  adminLabel: string;
  /** The users the admin keeps for this demo. One is the shipped default. */
  users: readonly { id: string; name: string }[];
  activeUserId: string;
  onSelectUser: (id: string) => void;
  /** The account has been changed in this window — worth a dot on the button. */
  edited: boolean;
  userOpen: boolean;
  /** False where the host site has a colour-scheme control of its own. */
  showTheme?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const divider = <span className="bg-border mx-0.5 h-5 w-px shrink-0" aria-hidden />;
  const activeUser = users.find((option) => option.id === activeUserId) ?? users[0];

  return (
    <div
      data-demo-dock=""
      className="demo-dock bg-background/85 pointer-events-auto fixed bottom-4 left-1/2 z-[70] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border px-2 py-1.5 shadow-lg backdrop-blur [scrollbar-width:none]"
      role="toolbar"
      aria-label="Embedded demo tools"
    >
      {/* The way back: these pages carry none of the template's chrome, and the
          sidebar entries open them in a new tab. */}
      <a
        href={HOME}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 text-[11px] font-medium tracking-wide uppercase transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
        title="Back to the SurveyJS demos"
      >
        <LayersIcon className="size-3.5" />
        SurveyJS demos
      </a>

      {divider}

      {/* The one control that is meant to be pressed, so the one control painted
          in the host brand rather than hidden in the greys. */}
      <Button
        asChild
        size="sm"
        className="demo-brand-bg text-primary-foreground shrink-0 gap-1.5 rounded-full font-semibold shadow-sm hover:opacity-90"
      >
        <a
          href={adminHref}
          title="Open the back office this form is maintained in — what is saved there is what this page renders"
        >
          <Code2Icon />
          {adminLabel}
        </a>
      </Button>

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

      {/* The picker, once the back office holds more than one person. */}
      {users.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 rounded-full"
              title="Sign in as somebody else — the same form, a different person"
            >
              <UsersRoundIcon />
              <span className="hidden max-w-48 truncate sm:inline">
                Login as: {activeUser?.name}
              </span>
              <ChevronDownIcon className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuLabel>Login as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={activeUserId} onValueChange={onSelectUser}>
              {users.map((option) => (
                <DropdownMenuRadioItem key={option.id} value={option.id}>
                  {option.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {onEditUser && (
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
          {edited && (
            <span
              className="bg-primary size-1.5 rounded-full opacity-70"
              aria-label="edited"
            />
          )}
        </Button>
      )}

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

      {/* Only where the host site has no control of its own: a colour scheme is
          the page's business, not the survey's. */}
      {showTheme && (
        <>
          {divider}
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 rounded-full"
            title={
              mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle colour scheme"
            }
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {mounted && isDark ? <MoonIcon /> : <SunIcon />}
            <span className="sr-only">Toggle colour scheme</span>
          </Button>
        </>
      )}
    </div>
  );
}
