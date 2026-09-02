"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardListIcon,
  CloudIcon,
  HeartPulseIcon,
  MessageSquareIcon,
  ShoppingCartIcon,
  SlidersHorizontalIcon,
  SquareArrowOutUpRightIcon,
  TableIcon,
  type LucideIcon,
} from "lucide-react";
import { isActiveRoute, navItems, type NavId, type NavItem } from "@/schemas";
import { cn } from "@/lib/utils";

const ICONS: Record<NavId, LucideIcon> = {
  claims: ClipboardListIcon,
  checkout: ShoppingCartIcon,
  records: TableIcon,
  embeddedFeedback: MessageSquareIcon,
  embeddedCloud: CloudIcon,
  embeddedClinic: HeartPulseIcon,
};

const ITEM_CLASS =
  "group flex items-start gap-3 rounded-md px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function ItemBody({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = ICONS[item.id];
  return (
    <>
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          active
            ? "text-sidebar-accent-foreground"
            : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
        )}
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          {item.label}
          {item.openInNewTab && (
            <SquareArrowOutUpRightIcon className="text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground size-3" />
          )}
        </span>
        <span className="text-muted-foreground text-xs leading-tight">
          {item.description}
        </span>
      </span>
    </>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const adminActive = isActiveRoute(pathname, "/admin");

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 p-3">
      {/* First, because it is the page worth sharing: every form below is edited
          here, and this is where the user each one is rendered for is kept. */}
      <Link
        href="/admin"
        onClick={onNavigate}
        aria-current={adminActive ? "page" : undefined}
        className={cn(
          ITEM_CLASS,
          adminActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <SlidersHorizontalIcon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            adminActive
              ? "text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground",
          )}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span>Survey admin</span>
          <span className="text-muted-foreground text-xs leading-tight">
            Edit any form as JSON, pick the user, preview the result.
          </span>
        </span>
      </Link>

      <span className="bg-sidebar-border my-1.5 h-px shrink-0" aria-hidden />

      {navItems.map((item) => {
        const active = !item.openInNewTab && isActiveRoute(pathname, item.path);

        if (item.openInNewTab) {
          return (
            <a
              key={item.id}
              href={item.path}
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
              className={cn(
                ITEM_CLASS,
                "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <ItemBody item={item} active={false} />
            </a>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.path}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              ITEM_CLASS,
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <ItemBody item={item} active={active} />
          </Link>
        );
      })}
    </nav>
  );
}
