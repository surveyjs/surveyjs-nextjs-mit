"use client";

import type { ReactNode } from "react";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { PlacementId } from "./demo-controls";

/**
 * The three overlay placements, shared by every embedded demo. The inline
 * placement is the page's own business — it is part of the layout — so only the
 * overlays live here.
 *
 * All three are opened with Radix's `modal={false}` so the demo toolbar stays
 * clickable over them: a reviewer can switch placement or recolour the brand
 * without closing the survey first. Two consequences are handled below — Radix
 * omits its own overlay in that mode, so the scrim is ours, and it treats a click
 * on the toolbar as an outside interaction, hence the dismissal guard.
 */
function keepOpenForDock(event: Event) {
  if ((event.target as HTMLElement | null)?.closest("[data-demo-dock]")) {
    event.preventDefault();
  }
}

export function OverlayPlacements({
  placement,
  open,
  onOpenChange,
  label,
  children,
}: {
  placement: PlacementId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible name for the dialog — the survey carries the visible heading. */
  label: string;
  children: ReactNode;
}) {
  if (placement === "inline") return null;

  return (
    <>
      {open && placement !== "bubble" && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => onOpenChange(false)}
          aria-hidden
        />
      )}

      {placement === "modal" && (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
          <DialogContent
            className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
            onInteractOutside={keepOpenForDock}
          >
            {/* The survey carries its own title and description, so the dialog's
                are for assistive tech only — two headings would read as a seam. */}
            <DialogHeader className="sr-only">
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription>
                A short form. You can close this at any point.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </DialogContent>
        </Dialog>
      )}

      {placement === "drawer" && (
        <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
          <SheetContent
            side="right"
            className="w-full gap-0 p-0 sm:max-w-2xl"
            onInteractOutside={keepOpenForDock}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{label}</SheetTitle>
              <SheetDescription>
                A short form. The page stays where you left it.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </SheetContent>
        </Sheet>
      )}

      {placement === "bubble" && (
        <>
          {open && (
            <div className="bg-card fixed right-6 bottom-24 z-40 flex max-h-[74vh] w-[28rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border shadow-2xl">
              <div className="flex justify-end border-b px-2 py-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close the feedback widget"
                  onClick={() => onOpenChange(false)}
                >
                  <XIcon />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            className={cn(
              "demo-brand-bg text-primary-foreground fixed right-6 bottom-6 z-40 flex size-14 items-center justify-center rounded-full shadow-xl transition-transform",
              "hover:scale-105 focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
            )}
          >
            {open ? <XIcon className="size-5" /> : <MessageCircleIcon className="size-5" />}
            <span className="sr-only">
              {open ? "Close the feedback widget" : "Open the feedback widget"}
            </span>
          </button>
        </>
      )}
    </>
  );
}

const CALLOUT_COPY: Record<Exclude<PlacementId, "inline">, string> = {
  modal: "The same form, centred over the page in a dialog.",
  drawer: "The same form, sliding in from the edge while the page stays put.",
  bubble: "The same form, behind the launcher in the bottom-right corner.",
};

/** What the page shows in the inline slot once the survey has moved elsewhere. */
export function PlacementCallout({
  placement,
  title,
  onOpen,
}: {
  placement: Exclude<PlacementId, "inline">;
  title: string;
  onOpen: () => void;
}) {
  return (
    <div className="bg-card flex flex-col items-start gap-4 rounded-xl border p-8 shadow-sm">
      <span className="demo-brand-soft flex size-10 items-center justify-center rounded-lg">
        <MessageCircleIcon className="size-5" />
      </span>
      <div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{CALLOUT_COPY[placement]}</p>
      </div>
      <Button className="demo-brand-bg gap-2 hover:opacity-90" onClick={onOpen}>
        Open the form
      </Button>
    </div>
  );
}
