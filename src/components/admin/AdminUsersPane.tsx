"use client";

import { PlusIcon, Trash2Icon, UserRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmbeddedSurvey } from "@/components/embedded/EmbeddedSurvey";
import {
  accountInitials,
  accountName,
  accountText,
  type DemoUser,
} from "@/components/embedded/demo-accounts";
import type { DemoUserRecord } from "@/storage/demo-users";
import type { SurveyData } from "@/schemas";
import { cn } from "@/lib/utils";

/**
 * The users pane: the back-office half of a personalized form.
 *
 * A form that arrives already filled in only means something if you can see it
 * arrive for somebody else, so this is the list of people the demo can be
 * rendered for — patients, accounts — and the editor for the one selected.
 *
 * The editor is not a form we wrote. It is `demo-accounts.ts`'s own survey JSON
 * rendered by the same component as the demo itself, which is the quiet claim
 * worth making in an admin: the library is good enough to build the admin's own
 * screens with, and the clinic's chart panel in here is `visibleIf`-gated by the
 * same mechanism the appointment form uses.
 *
 * Underneath, the object the survey is actually handed. Read-only — the form
 * above is how you change it.
 */
export function AdminUsersPane({
  user,
  users,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  editorKey,
  editorSeed,
  onDataChange,
  account,
  wiredKeys,
}: {
  /** The account shape for this form, and the survey that edits it. */
  user: DemoUser;
  users: readonly DemoUserRecord[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  /** Changes when the editor has to remount — a different user, or a revert. */
  editorKey: string;
  /** The answers the editor opens on. Stable, so typing never rebuilds it. */
  editorSeed: SurveyData;
  onDataChange: (data: SurveyData) => void;
  /** The selected user as the survey receives it: `{user.…}`. */
  account: Record<string, unknown>;
  /** Keys of `account` the current definition actually reads. */
  wiredKeys: readonly string[];
}) {
  const shown = wiredKeys.slice(0, 8);
  const rest = wiredKeys.length - shown.length;

  return (
    <section
      aria-label="Users"
      className="flex min-h-0 flex-col overflow-hidden rounded-lg border"
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div>
          <p className="text-sm font-semibold">Users</p>
          <p className="text-muted-foreground text-xs">
            Who the form is rendered for.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onAdd}>
          <PlusIcon />
          Add
        </Button>
      </div>

      <ul className="max-h-48 shrink-0 overflow-y-auto border-b">
        {users.map((record) => {
          const derived = user.toAccount(record.data);
          const active = record.id === activeId;
          const secondary =
            accountText(derived, "email") ||
            accountText(derived, "company") ||
            accountText(derived, "companyName") ||
            accountText(derived, "mrn");

          return (
            <li key={record.id} className="flex items-stretch border-b last:border-b-0">
              <button
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(record.id)}
                className={cn(
                  "focus-visible:ring-ring/50 flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
                  active ? "bg-accent/60" : "hover:bg-accent/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {accountInitials(derived)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {accountName(derived) || "Unnamed user"}
                  </span>
                  {secondary && (
                    <span className="text-muted-foreground truncate text-xs">
                      {secondary}
                    </span>
                  )}
                </span>
              </button>
              {/* One user has to remain, otherwise the demo has nobody signed in. */}
              {users.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive m-1 shrink-0 self-center"
                  aria-label={`Remove ${accountName(user.toAccount(record.data)) || "user"}`}
                  onClick={() => onRemove(record.id)}
                >
                  <Trash2Icon />
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="text-muted-foreground flex items-center gap-1.5 px-3 pt-2.5 text-xs">
          <UserRoundIcon className="size-3.5" />
          This editor is a SurveyJS form too.
        </div>

        <EmbeddedSurvey key={editorKey} json={user.json} data={editorSeed} onDataChange={onDataChange} />

        <div className="border-t p-3">
          <p className="text-muted-foreground text-xs">
            Handed to survey-core as one variable,{" "}
            <code className="text-foreground text-[11px]">user</code>.{" "}
            {wiredKeys.length > 0 ? (
              <>
                The definition on the left reads{" "}
                <span className="text-foreground font-medium">{shown.join(", ")}</span>
                {rest > 0 ? ` and ${rest} more` : ""} off it.
              </>
            ) : (
              "The definition on the left does not read anything off it yet."
            )}
          </p>
          <pre className="bg-muted/50 mt-2 max-h-56 overflow-auto rounded-lg border p-3 text-[11px] leading-relaxed">
            {JSON.stringify(account, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}
