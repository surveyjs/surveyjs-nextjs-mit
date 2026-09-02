"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  RotateCcwIcon,
  SquareArrowOutUpRightIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmbeddedSurvey, SurveyCard } from "@/components/embedded/EmbeddedSurvey";
import { StaticAnalysisBar, type LintMarker } from "@/components/lint/StaticAnalysisBar";
import type { JsonEditorApi } from "@/components/JsonEditor";
import { usedVariableKeys } from "@/components/embedded/demo-accounts";
import { loadSurveyJson, resetSurveyJson, saveSurveyJson } from "@/storage/survey-json";
import {
  loadDemoUsers,
  resetDemoUsers,
  saveDemoUsers,
  type DemoUserRecord,
} from "@/storage/demo-users";
import type { SurveyData, SurveyJSON } from "@/schemas";
import { cn } from "@/lib/utils";
import { ADMIN_FORMS, type AdminForm, getAdminForm } from "./admin-forms";
import { AdminUsersPane } from "./AdminUsersPane";

const JsonEditor = dynamic(() => import("@/components/JsonEditor"), {
  ssr: false,
  loading: () => (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Loading editor…
    </div>
  ),
});

const PREVIEW_DEBOUNCE_MS = 400;
const INSTALL_LINE = "npm i survey-core survey-react-ui";
/**
 * The one variable the personalized forms are rendered for.
 *
 * The linter reads the JSON and nothing else, so `{user.firstName}` looks like a
 * reference to a question that does not exist — 48 findings on a form that is
 * working exactly as designed. Naming it here is the same declaration the page
 * makes at runtime with `setVariable("user", account)`.
 */
const RUNTIME_VARIABLES = ["user"] as const;

function parse(source: string): { json?: SurveyJSON; error?: string } {
  try {
    const parsed = JSON.parse(source);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { error: "The survey definition must be a JSON object." };
    }
    return { json: parsed as SurveyJSON };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

/**
 * The admin: one editor for every form in the template.
 *
 * This is the page to share with somebody who has ten minutes. It puts the three
 * claims side by side, in the order they need to be understood:
 *
 *  1. **the form is a JSON document** — the editor on the left, with survey-core's
 *     own linter under it;
 *  2. **it is rendered for a person** — the users pane in the middle, itself built
 *     out of SurveyJS, with the object it produces shown as JSON;
 *  3. **and a working form comes out** — the column on the right, which follows
 *     both of the above as they are typed.
 *
 * The primary button then takes that same definition and that same user out to
 * where the form actually lives: this admin's own Claims page for the plain
 * forms, and somebody else's website for the embedded ones. That is the whole
 * argument of the template in two clicks, and it is why the demos link back here
 * rather than carrying an editor of their own.
 *
 * Edits are per browser (localStorage — see `survey-json.ts` and `demo-users.ts`),
 * so the URL is safe to hand around: what a visitor breaks is theirs alone, and
 * the server keeps serving the definition that ships with the template.
 */
export function AdminWorkbench() {
  const router = useRouter();
  const params = useSearchParams();
  const form = getAdminForm(params.get("form"));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3">
        <h1 className="text-xl font-semibold tracking-tight">Survey admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Every form in this template is the JSON on the left, rendered for the user in
          the middle. Change either one and the form on the right follows.
        </p>
      </div>

      <nav aria-label="Forms" className="mb-3 flex flex-wrap gap-1.5">
        {ADMIN_FORMS.map((item) => {
          const active = item.id === form.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              title={item.hint}
              onClick={() => router.replace(`/admin?form=${item.id}`, { scroll: false })}
              className={cn(
                "focus-visible:ring-ring/50 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
                active
                  ? "bg-primary text-primary-foreground border-transparent font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Keyed, so switching forms starts every piece of state clean rather than
          carrying one form's users or edits into the next. */}
      <AdminFormWorkbench key={form.id} form={form} />
    </div>
  );
}

/**
 * Unsaved work, per form, for as long as the tab lives.
 *
 * Each form gets its own workbench instance — keyed by id, so nothing leaks
 * between them — which would otherwise mean that clicking another form and
 * coming back silently threw the edit away. Presenting a JSON editor that loses
 * what you typed the moment you look at something else is not a demo anyone
 * finishes; storage is still only written by the primary button.
 */
interface Draft {
  readonly source: string;
  readonly users: readonly DemoUserRecord[];
  readonly activeUserId: string;
}

const drafts = new Map<string, Draft>();

/**
 * The users, serialised for a plain "has anything changed?".
 *
 * Key-order-insensitive because a survey model rebuilds its data in question
 * order, which is not the order the defaults were written in — a raw comparison
 * would call every account edited the moment the editor mounted.
 */
function stableUsers(users: readonly DemoUserRecord[]): string {
  return JSON.stringify(
    users.map((record) => [
      record.id,
      Object.keys(record.data)
        .sort()
        .map((key) => [key, record.data[key]]),
    ]),
  );
}

/** A newly added user needs an id no reload can collide with. */
function newUserId(): string {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function AdminFormWorkbench({ form }: { form: AdminForm }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  // Read once: after this the draft is written, not read, so a later save or
  // reset cannot fight the state it seeded.
  const [draft] = useState(() => drafts.get(form.id));

  /* ── the definition ──────────────────────────────────────────────────────── */

  const defaultSource = useMemo(() => JSON.stringify(form.json, null, 2), [form.json]);
  const [source, setSource] = useState(draft?.source ?? defaultSource);
  const [preview, setPreview] = useState(draft?.source ?? defaultSource);
  const [customized, setCustomized] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // This browser's saved definition, if it has one, so the editor never sits on
  // the canonical JSON for somebody who has their own.
  useEffect(() => {
    if (draft) return;
    let active = true;
    void loadSurveyJson(form.id).then((saved) => {
      if (!active || !saved) return;
      const loaded = JSON.stringify(saved, null, 2);
      setSource(loaded);
      setPreview(loaded);
      setCustomized(true);
    });
    return () => {
      active = false;
    };
  }, [draft, form.id]);

  useEffect(() => {
    const timer = setTimeout(() => setPreview(source), PREVIEW_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [source]);

  // Parsed once and shared: the banner, Format and the linter all read this, so
  // one keystroke never parses the document twice.
  const parsedSource = useMemo(() => parse(source), [source]);
  const parsedPreview = useMemo(() => parse(preview), [preview]);
  const syntaxError = parsedSource.error;

  const [markers, setMarkers] = useState<readonly LintMarker[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const editorApi = useRef<JsonEditorApi | null>(null);

  const selectedLine = useMemo(
    () => markers.find((marker) => marker.path === selectedPath)?.line ?? null,
    [markers, selectedPath],
  );

  /* ── the users it is rendered for ────────────────────────────────────────── */

  const defaultUsers = useMemo<readonly DemoUserRecord[]>(
    () => (form.user ? [{ id: "default", data: form.user.defaults }] : []),
    [form.user],
  );
  const [users, setUsers] = useState<readonly DemoUserRecord[]>(
    draft?.users ?? defaultUsers,
  );
  const [activeUserId, setActiveUserId] = useState(
    draft?.activeUserId ?? defaultUsers[0]?.id ?? "",
  );
  // The answers the editor opens on, plus a counter that remounts it. Kept apart
  // from `users` because survey-core rebuilds its model whenever `data` changes
  // identity — feeding the live record back would restart the editor on every
  // letter typed into it.
  const editorSeed = useRef<SurveyData>(
    (draft
      ? draft.users.find((record) => record.id === draft.activeUserId)?.data
      : undefined) ??
      defaultUsers[0]?.data ??
      {},
  );
  const [editorRun, setEditorRun] = useState(0);

  // Every keystroke lands here, so coming back to this form finds it as it was.
  useEffect(() => {
    drafts.set(form.id, { source, users, activeUserId });
  }, [activeUserId, form.id, source, users]);

  useEffect(() => {
    if (draft || !form.user) return;
    let active = true;
    void loadDemoUsers(form.id).then((saved) => {
      if (!active || !saved) return;
      setUsers(saved);
      setActiveUserId(saved[0].id);
      editorSeed.current = saved[0].data;
      setEditorRun((run) => run + 1);
    });
    return () => {
      active = false;
    };
  }, [draft, form.id, form.user]);

  const activeUser = users.find((record) => record.id === activeUserId) ?? users[0];

  const account = useMemo(
    () => (form.user && activeUser ? form.user.toAccount(activeUser.data) : null),
    [form.user, activeUser],
  );
  const variables = useMemo(() => (account ? { user: account } : undefined), [account]);

  const selectUser = useCallback(
    (id: string) => {
      const record = users.find((item) => item.id === id);
      if (!record) return;
      setActiveUserId(id);
      editorSeed.current = record.data;
      setEditorRun((run) => run + 1);
    },
    [users],
  );

  // A new user starts as a copy of the selected one: an empty account renders an
  // empty form, and the comparison worth showing is two people who differ in one
  // field.
  const addUser = useCallback(() => {
    if (!activeUser) return;
    const record = { id: newUserId(), data: { ...activeUser.data } };
    setUsers((current) => [...current, record]);
    setActiveUserId(record.id);
    editorSeed.current = record.data;
    setEditorRun((run) => run + 1);
  }, [activeUser]);

  const removeUser = useCallback(
    (id: string) => {
      setUsers((current) => {
        if (current.length < 2) return current;
        const next = current.filter((record) => record.id !== id);
        if (id === activeUserId) {
          setActiveUserId(next[0].id);
          editorSeed.current = next[0].data;
          setEditorRun((run) => run + 1);
        }
        return next;
      });
    },
    [activeUserId],
  );

  const changeUserData = useCallback(
    (data: SurveyData) => {
      setUsers((current) =>
        current.map((record) => (record.id === activeUserId ? { ...record, data } : record)),
      );
    },
    [activeUserId],
  );

  /* ── actions ─────────────────────────────────────────────────────────────── */

  const applyJson = useCallback((json: Record<string, unknown>) => {
    setSource(JSON.stringify(json, null, 2));
    setSelectedPath(null);
  }, []);

  const revealLine = useCallback((line: number) => {
    editorApi.current?.revealLine(line);
  }, []);

  const format = useCallback(() => {
    const { json } = parsedSource;
    if (json) setSource(JSON.stringify(json, null, 2));
  }, [parsedSource]);

  const reset = useCallback(async () => {
    await resetSurveyJson(form.id);
    await resetDemoUsers(form.id);
    drafts.delete(form.id);
    setSource(defaultSource);
    setCustomized(false);
    setStorageError(null);
    // Also drops whatever a "Try breaking it" action injected: those only ever
    // write to `source`, which this restores.
    setSelectedPath(null);
    setUsers(defaultUsers);
    setActiveUserId(defaultUsers[0]?.id ?? "");
    editorSeed.current = defaultUsers[0]?.data ?? {};
    setEditorRun((run) => run + 1);
  }, [defaultSource, defaultUsers, form.id]);

  // Save, then go where the form actually lives. For the embedded demos that is
  // somebody else's website, which is the reason to press it.
  const saveAndOpen = useCallback(async () => {
    const { json, error } = parse(source);
    if (!json) {
      setStorageError(error ?? "Invalid JSON.");
      return;
    }
    try {
      await saveSurveyJson(form.id, json);
      if (form.user) await saveDemoUsers(form.id, users);
    } catch (failure) {
      setStorageError((failure as Error).message);
      return;
    }
    setStorageError(null);
    router.push(form.href);
  }, [form.href, form.id, form.user, router, source, users]);

  const [copied, setCopied] = useState(false);
  const copyInstall = useCallback(() => {
    void navigator.clipboard?.writeText(INSTALL_LINE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, []);

  const wiredKeys = useMemo(
    () =>
      account && parsedPreview.json ? usedVariableKeys(parsedPreview.json, account) : [],
    [account, parsedPreview.json],
  );

  const dirty =
    source !== defaultSource ||
    customized ||
    stableUsers(users) !== stableUsers(defaultUsers);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-xs">
          {form.hint} Edits are kept in this browser only.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={format}
            disabled={Boolean(syntaxError)}
          >
            <WandSparklesIcon />
            Format
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={reset}
            disabled={!dirty}
          >
            <RotateCcwIcon />
            Reset
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={saveAndOpen}
            disabled={Boolean(syntaxError)}
          >
            {form.embedded ? <SquareArrowOutUpRightIcon /> : <CheckIcon />}
            {form.previewLabel}
          </Button>
        </div>
      </div>

      {(syntaxError || storageError) && (
        <div className="border-destructive/50 text-destructive mb-3 rounded-md border px-3 py-2 text-sm">
          {storageError ?? syntaxError}
        </div>
      )}

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-4",
          form.user
            ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.95fr)_minmax(0,0.95fr)]"
            : "lg:grid-cols-2",
        )}
      >
        <div className="flex min-h-[26rem] min-w-0 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
            <div className="min-h-0 flex-1">
              <JsonEditor
                value={source}
                onChange={setSource}
                dark={resolvedTheme === "dark"}
                markers={markers}
                highlightLine={selectedLine}
                onReady={(api) => {
                  editorApi.current = api;
                }}
                onMarkerActivate={setSelectedPath}
              />
            </div>
            <StaticAnalysisBar
              text={source}
              json={parsedSource.json ?? null}
              onRevealLine={revealLine}
              onMarkersChange={setMarkers}
              onApplyJson={applyJson}
              selectedPath={selectedPath}
              onSelectPath={setSelectedPath}
              knownVariables={form.user ? RUNTIME_VARIABLES : undefined}
            />
          </div>

          {/* Two lines for the visitor who is already convinced: what to install,
              and where this exact definition lives in the repository. */}
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs">
            <code className="text-foreground text-[11px]">{INSTALL_LINE}</code>
            <span className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copy the install command"
                onClick={copyInstall}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </Button>
              <a
                href={form.sourceHref}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground flex items-center gap-1 underline decoration-dotted"
              >
                This form in the source
                <ArrowUpRightIcon className="size-3" />
              </a>
            </span>
          </div>
        </div>

        {form.user && activeUser && account && (
          <AdminUsersPane
            user={form.user}
            users={users}
            activeId={activeUser.id}
            onSelect={selectUser}
            onAdd={addUser}
            onRemove={removeUser}
            editorKey={`${activeUser.id}-${editorRun}`}
            editorSeed={editorSeed.current}
            onDataChange={changeUserData}
            account={account}
            wiredKeys={wiredKeys}
          />
        )}

        {/* No heading: this column is the form, and naming it would only invite
            the question of what makes it different from the real one. */}
        <div className="min-h-0 min-w-0 overflow-y-auto">
          {parsedPreview.json ? (
            <SurveyCard>
              <EmbeddedSurvey
                key={`${preview}-${activeUser?.id ?? ""}-${editorRun}`}
                json={parsedPreview.json}
                variables={variables}
              />
            </SurveyCard>
          ) : (
            <div className="text-muted-foreground rounded-lg border p-6 text-sm">
              {parsedPreview.error}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
