"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SurveyData, SurveyJSON } from "@/schemas";
import { loadSurveyJson } from "@/storage/survey-json";
import { loadDemoUsers, type DemoUserRecord } from "@/storage/demo-users";
import { adminHref } from "@/lib/routes";
import { DEFAULT_BRAND_ID, applyBrand, getBrand, type DemoSurvey } from "./demo-controls";
import { accountName, type DemoUser } from "./demo-accounts";

/**
 * Everything the embedded demos have in common, minus the page itself.
 *
 * Each demo is one host site with one form sitting inline in it, in its own brand
 * colour. Two things about that form are worth proving, and neither of them is
 * done here any more:
 *
 *  1. **it is a JSON document** — edited in the admin (`/admin`), which the
 *     toolbar links to. The definition saved there is what these pages render,
 *     so a reviewer sees the round trip rather than a second editor;
 *  2. **it is rendered for a person** — the toolbar's user popup, whose editor is
 *     itself a SurveyJS form, and the dropdown next to it when the admin holds
 *     more than one user. Changing the user moves values *and* structure, because
 *     the definition reads it as `{user.something}`.
 *
 * Prefill and Reset are there so the pair can be demonstrated on a full form
 * without typing twelve answers first, and "Highlight SurveyJS Render" answers
 * the question every reviewer asks about an embedded demo: which part of this
 * page is actually the form?
 */
export interface DemoChrome {
  readonly survey: DemoSurvey;
  /** The definition to render: the shipped one, or this browser's saved one. */
  readonly json: SurveyJSON;
  /** Answers to load. `undefined` means start empty. */
  readonly seed: SurveyData | undefined;
  /**
   * What the host app knows about the visitor, ready for `setVariable`.
   *
   * One variable, `user`, holding the whole account — so the definition reads
   * `{user.firstName}` and can never collide with a question of the same name
   * (the clinic form has questions called `firstName` and `email`).
   */
  readonly variables: Record<string, unknown>;
  /** The same object, for the host page's own header and copy. */
  readonly account: Record<string, unknown>;
  /** Changes whenever the survey has to be rebuilt from scratch. */
  readonly runKey: string;
  /** Scrolls the page to the form. */
  readonly requestSurvey: () => void;
  /** Rebuild the survey carrying these answers over — "change my answers". */
  readonly resumeWith: (data: SurveyData) => void;
  readonly dockProps: {
    highlight: boolean;
    onToggleHighlight: () => void;
    onPrefill: () => void;
    onReset: () => void;
    /** Absent when a back office owns the record instead. */
    onEditUser?: () => void;
    /** Where this form is maintained, and what the button says. */
    adminHref: string;
    adminLabel: string;
    /** The users the admin keeps for this demo, by display name. */
    users: readonly { id: string; name: string }[];
    activeUserId: string;
    onSelectUser: (id: string) => void;
    /** The account has been changed in this window — worth a dot. */
    edited: boolean;
    userOpen: boolean;
  };
  readonly userDialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    json: SurveyJSON;
    defaults: SurveyData;
    formKey: string;
    onDataChange: (data: SurveyData) => void;
    account: Record<string, unknown>;
    edited: boolean;
    onRevert: () => void;
    adminHref: string;
  };
}

const DEBOUNCE_MS = 400;

/**
 * Key-order-insensitive serialisation, for "has this been edited?".
 *
 * A survey model rebuilds its data in question order, which is not the order the
 * defaults were written in — comparing raw JSON would report every account as
 * edited the moment the editor mounted.
 */
function stableJson(value: SurveyData): string {
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = value[key];
        return acc;
      }, {}),
  );
}

export function useDemoChrome({
  survey,
  user,
  /** Element the form lives in, so the demo can scroll back to it. */
  anchorId,
  brandId = DEFAULT_BRAND_ID,
  roster,
  admin,
  allowUserEdit = true,
}: {
  survey: DemoSurvey;
  /** The visitor, plus the survey used to edit them. */
  user: DemoUser;
  anchorId: string;
  /** Palette the demo runs in, so no two host sites look alike. */
  brandId?: string;
  /**
   * The people this demo ships with, when it ships with more than one — the
   * clinic has a roster of patients, and the toolbar lets a reviewer sign in as
   * any of them.
   */
  roster?: readonly DemoUserRecord[];
  /** The back office this form is maintained in, if it has its own. */
  admin?: string;
  /**
   * Whether the toolbar may edit the account in place. Off where a back office
   * owns the record: a reviewer on the public site picks who they are, and the
   * chart is changed by staff.
   */
  allowUserEdit?: boolean;
}): DemoChrome {
  // A fresh seed object remounts the survey model, which is what Prefill and
  // Reset want; `runCount` covers resetting when there was nothing to clear.
  const [seed, setSeed] = useState<SurveyData | undefined>(undefined);
  const [runCount, setRunCount] = useState(0);
  const [userOpen, setUserOpen] = useState(false);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    applyBrand(getBrand(brandId));
  }, [brandId]);

  // The demo owns the palette only while it is on screen.
  useEffect(() => () => applyBrand(getBrand("neutral")), []);

  // One attribute on <html>; the outline itself is in `globals.css`, keyed off
  // the `data-survey-root` marker that `SurveyCard` carries.
  useEffect(() => {
    const root = document.documentElement;
    if (highlight) root.setAttribute("data-demo-highlight", "");
    else root.removeAttribute("data-demo-highlight");
    return () => root.removeAttribute("data-demo-highlight");
  }, [highlight]);

  /* ── the definition, as the admin left it ────────────────────────────────── */

  const [json, setJson] = useState<SurveyJSON>(survey.json);

  /* ── the user the definition is rendered for ─────────────────────────────── */

  // One record per user, exactly as the admin keeps them: `saved` is what
  // storage holds, `users` is what this window has since done to it.
  const defaults = useMemo<readonly DemoUserRecord[]>(
    () => roster ?? [{ id: "default", data: user.defaults }],
    [roster, user.defaults],
  );
  const [saved, setSaved] = useState(defaults);
  const [users, setUsers] = useState(defaults);
  const [activeUserId, setActiveUserId] = useState(defaults[0].id);

  // The answers the popup's editor opens on, and a counter that remounts it.
  // Kept apart from `users` because survey-core rebuilds its model whenever
  // `data` changes identity — feeding the live record back would restart the
  // editor on every letter typed into it.
  const editorSeed = useRef<SurveyData>(defaults[0].data);
  const [editorRun, setEditorRun] = useState(0);

  // The server always renders the definition and the roster that ship with the
  // template — the prerendered HTML, the one crawlers get, stays canonical — and
  // whatever this browser saved in the admin arrives a tick after hydration.
  useEffect(() => {
    let active = true;
    void Promise.all([loadSurveyJson(survey.id), loadDemoUsers(survey.id)]).then(
      ([storedJson, storedUsers]) => {
        if (!active || (!storedJson && !storedUsers)) return;
        if (storedUsers) {
          setSaved(storedUsers);
          setUsers(storedUsers);
          setActiveUserId(storedUsers[0].id);
          editorSeed.current = storedUsers[0].data;
          setEditorRun((run) => run + 1);
        }
        if (storedJson) setJson(storedJson);
        // A different definition or a different person is a different form, so
        // the model is rebuilt rather than re-fed.
        setRunCount((count) => count + 1);
      },
    );
    return () => {
      active = false;
    };
  }, [survey.id]);

  const activeRecord = users.find((record) => record.id === activeUserId) ?? users[0];
  const savedRecord = saved.find((record) => record.id === activeUserId);

  // The answers the page is currently rendered from. Debounced away from the
  // editor's own state for the same reason the JSON editor was: typing a name
  // should not rebuild the survey model on every keystroke.
  const [appliedForm, setAppliedForm] = useState<SurveyData>(activeRecord.data);

  useEffect(() => {
    if (activeRecord.data === appliedForm) return;
    const timer = setTimeout(() => {
      setAppliedForm(activeRecord.data);
      // A different user is a different form, so the model is rebuilt rather
      // than re-fed — `runKey` remounts it.
      setRunCount((count) => count + 1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [activeRecord.data, appliedForm]);

  const account = useMemo(() => user.toAccount(appliedForm), [user, appliedForm]);
  const variables = useMemo(() => ({ user: account }), [account]);

  const accountEdited = useMemo(
    () =>
      stableJson(activeRecord.data) !==
      stableJson(savedRecord?.data ?? defaults[0].data),
    [activeRecord.data, savedRecord, defaults],
  );

  const userOptions = useMemo(
    () =>
      users.map((record) => ({
        id: record.id,
        name: accountName(user.toAccount(record.data)) || "Unnamed user",
      })),
    [users, user],
  );

  /* ── actions ─────────────────────────────────────────────────────────────── */

  const revealAnchor = useCallback(() => {
    requestAnimationFrame(() =>
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth" }),
    );
  }, [anchorId]);

  // Turning the outline on also brings the form into view: on these pages the
  // survey can easily be below the fold, and an outline nobody can see proves
  // nothing.
  const toggleHighlight = useCallback(() => {
    if (!highlight) revealAnchor();
    setHighlight((on) => !on);
  }, [highlight, revealAnchor]);

  const restart = useCallback(() => {
    setSeed(undefined);
    setRunCount((count) => count + 1);
  }, []);

  const prefill = useCallback(() => {
    setSeed({ ...survey.prefill });
    setRunCount((count) => count + 1);
  }, [survey.prefill]);

  const resumeWith = useCallback(
    (data: SurveyData) => {
      setSeed({ ...data });
      setRunCount((count) => count + 1);
      revealAnchor();
    },
    [revealAnchor],
  );

  const selectUser = useCallback(
    (id: string) => {
      const record = users.find((item) => item.id === id);
      if (!record) return;
      setActiveUserId(id);
      editorSeed.current = record.data;
      setEditorRun((run) => run + 1);
      setAppliedForm(record.data);
      setRunCount((count) => count + 1);
    },
    [users],
  );

  const changeUserData = useCallback(
    (data: SurveyData) => {
      setUsers((current) =>
        current.map((record) =>
          record.id === activeUserId ? { ...record, data } : record,
        ),
      );
    },
    [activeUserId],
  );

  const revertAccount = useCallback(() => {
    const original = savedRecord?.data ?? defaults[0].data;
    setUsers((current) =>
      current.map((record) =>
        record.id === activeUserId ? { ...record, data: original } : record,
      ),
    );
    editorSeed.current = original;
    setEditorRun((run) => run + 1);
    setAppliedForm(original);
    setRunCount((count) => count + 1);
  }, [activeUserId, defaults, savedRecord]);

  const href = admin ?? adminHref(survey.id);

  return {
    survey,
    json,
    seed,
    variables,
    account,
    runKey: `${survey.id}-${runCount}`,
    requestSurvey: revealAnchor,
    resumeWith,
    dockProps: {
      highlight,
      onToggleHighlight: toggleHighlight,
      onPrefill: prefill,
      onReset: restart,
      onEditUser: allowUserEdit ? () => setUserOpen((open) => !open) : undefined,
      adminHref: href,
      adminLabel: admin ? "Go back to admin" : "Configure in admin",
      users: userOptions,
      activeUserId: activeRecord.id,
      onSelectUser: selectUser,
      edited: accountEdited,
      userOpen,
    },
    userDialogProps: {
      open: userOpen,
      onOpenChange: setUserOpen,
      json: user.json,
      defaults: editorSeed.current,
      formKey: `user-${activeRecord.id}-${editorRun}`,
      onDataChange: changeUserData,
      account,
      edited: accountEdited,
      onRevert: revertAccount,
      adminHref: href,
    },
  };
}
