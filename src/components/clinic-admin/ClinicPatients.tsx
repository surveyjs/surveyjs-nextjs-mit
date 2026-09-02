"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon, RotateCcwIcon } from "lucide-react";
import type { Model } from "survey-core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SurveyForm } from "@/components/SurveyForm";
import {
  CHART_CONDITIONS,
  CLINIC_PATIENTS,
  getPlan,
  patientRecordJson,
  type SurveyData,
} from "@/schemas";
import {
  loadDemoUsers,
  resetDemoUsers,
  saveDemoUsers,
  type DemoUserRecord,
} from "@/storage/demo-users";
import { cn } from "@/lib/utils";

interface Editor {
  readonly id: string;
  /** Bumped on every open, so the survey remounts on the record it was given. */
  readonly key: number;
}

/**
 * One colour per payer, the way a scheduler reads the column: what the patient
 * owes at the desk depends on it, so it is the first thing the eye needs.
 */
const COVERAGE_BADGE: Record<string, string> = {
  meridian: "bg-sky-500/15 text-sky-700 dark:text-sky-300 dark:bg-sky-400/15",
  blueharbor:
    "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-400/15",
  evergreen:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-400/15",
  statecare:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-400/15",
  medicaid:
    "bg-violet-500/15 text-violet-700 dark:text-violet-300 dark:bg-violet-400/15",
};

/** The list, as the practice would print it. */
function patientName(data: SurveyData): string {
  const name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  return name || "New patient";
}

function conditionLabels(data: SurveyData): string {
  const ids = Array.isArray(data.conditions) ? (data.conditions as string[]) : [];
  const labels = ids.map(
    (id) => CHART_CONDITIONS.find((condition) => condition.id === id)?.label ?? id,
  );
  return labels.length > 0 ? labels.join(", ") : "—";
}

function newPatientId(): string {
  return `patient-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Patients — the half of the demo people forget a form even has.
 *
 * A practice knows who its patients are before they open a form, and this is
 * that list: charts, coverage, history. There is no JSON on this screen on
 * purpose. It is a staff member correcting a phone number or adding a diagnosis,
 * and the point is what happens next — the public appointment form is rendered
 * from this record, so a problem list edited here changes which questions that
 * patient is asked.
 *
 * The chart on the right is a SurveyJS survey
 * ([patient-record.ts](src/schemas/patient-record.ts)), editable as it opens and
 * with every field on it — coverage and problem list included — which is the
 * quiet claim worth making in an admin: the library is good enough to build the
 * back office with, not only the public form.
 *
 * Records live in this browser (see `demo-users.ts`). In a real practice this
 * screen is a read of your patient database, and the person the website
 * personalises for is whoever is signed in.
 */
export function ClinicPatients({ formId }: { formId: string }) {
  const [patients, setPatients] = useState<readonly DemoUserRecord[]>(CLINIC_PATIENTS);
  const [editor, setEditor] = useState<Editor | null>(() =>
    CLINIC_PATIENTS[0] ? { id: CLINIC_PATIENTS[0].id, key: 0 } : null,
  );
  const [deleteTarget, setDeleteTarget] = useState<DemoUserRecord | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let active = true;
    void loadDemoUsers(formId).then((stored) => {
      if (!active || !stored) return;
      setPatients(stored);
      setEditor((prev) => ({ id: stored[0].id, key: (prev?.key ?? 0) + 1 }));
    });
    return () => {
      active = false;
    };
  }, [formId]);

  const persist = useCallback(
    async (next: readonly DemoUserRecord[]) => {
      setPatients(next);
      try {
        await saveDemoUsers(formId, next);
        setError(null);
      } catch (failure) {
        setError((failure as Error).message);
      }
    },
    [formId],
  );

  const open = useCallback((id: string) => {
    setEditor((prev) => ({ id, key: (prev?.key ?? 0) + 1 }));
  }, []);

  const selected = useMemo(
    () => patients.find((patient) => patient.id === editor?.id) ?? null,
    [editor?.id, patients],
  );

  // A blank chart, because that is what a new patient is: the website renders
  // the long version of the form for them.
  const add = useCallback(() => {
    const record: DemoUserRecord = { id: newPatientId(), data: { isNewPatient: true } };
    void persist([...patients, record]);
    open(record.id);
  }, [open, patients, persist]);

  const save = useCallback(
    async (data: SurveyData) => {
      if (!editor) return;
      await persist(
        patients.map((patient) =>
          patient.id === editor.id ? { id: patient.id, data } : patient,
        ),
      );
      setSavedAt(Date.now());
    },
    [editor, patients, persist],
  );

  // The way back out of an afternoon of presenting: drop this browser's roster
  // and the three patients the demo ships with are on file again.
  const resetDemo = useCallback(async () => {
    await resetDemoUsers(formId);
    setPatients(CLINIC_PATIENTS);
    setEditor((prev) => ({ id: CLINIC_PATIENTS[0].id, key: (prev?.key ?? 0) + 1 }));
    setSavedAt(0);
    setError(null);
  }, [formId]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    // One has to remain: the website renders the form for somebody.
    if (patients.length > 1) {
      const remaining = patients.filter((patient) => patient.id !== deleteTarget.id);
      void persist(remaining);
      setEditor((prev) =>
        prev?.id === deleteTarget.id
          ? { id: remaining[0].id, key: (prev?.key ?? 0) + 1 }
          : prev,
      );
    }
    setDeleteTarget(null);
  }, [deleteTarget, patients, persist]);

  return (
    <>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight">Patients</h1>
            <span className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={resetDemo}
                title="Restore the patients this demo ships with"
              >
                <RotateCcwIcon />
                Reset demo data
              </Button>
              <Button size="sm" className="gap-2" onClick={add}>
                <PlusIcon />
                Add patient
              </Button>
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            The chart behind the appointment form: what is on file here is what a
            patient is never asked for.
          </p>
        </div>

        {selected && (
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{patientName(selected.data)}</h2>
            <span className="flex items-center gap-2">
              {savedAt > 0 && (
                <span className="text-muted-foreground text-xs">Chart saved</span>
              )}
              <Button size="sm" onClick={() => model?.completeLastPage()}>
                Save changes
              </Button>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="border-destructive/50 text-destructive mb-3 rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Half the screen each, and the table scrolls inside its half rather than
          pushing the chart off the page. */}
      <div className="mt-4 grid min-w-0 items-start gap-6 lg:grid-cols-2">
        <Card className="min-w-0 overflow-x-auto py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Born</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Problem list</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => {
                const data = patient.data;
                const plan = getPlan(String(data.healthPlanOnFile ?? ""));
                const active = editor?.id === patient.id;
                return (
                  <TableRow
                    key={patient.id}
                    data-state={active ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => open(patient.id)}
                  >
                    <TableCell className="font-medium">
                      <span className="flex flex-col">
                        {patientName(data)}
                        <span className="text-muted-foreground text-xs">
                          {data.isNewPatient ? "New patient" : "Established"}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {String(data.dateOfBirth ?? "—")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "whitespace-nowrap",
                          COVERAGE_BADGE[String(data.healthPlanOnFile ?? "")] ??
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {plan?.name ?? "Self-pay"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="max-w-40 truncate text-sm"
                      title={conditionLabels(data)}
                    >
                      {conditionLabels(data)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          disabled={patients.length < 2}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteTarget(patient);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {mounted && editor && selected && (
          <div className="min-w-0 lg:sticky lg:top-20">
            <SurveyForm
              key={editor.key}
              schema={patientRecordJson}
              data={selected.data}
              onComplete={save}
              onModelReady={setModel}
            />
          </div>
        )}
      </div>

      <Dialog open={deleteTarget !== null} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this patient?</DialogTitle>
            <DialogDescription>
              This drops{" "}
              <span className="font-medium">
                {deleteTarget ? patientName(deleteTarget.data) : ""}
              </span>{" "}
              from the demo roster, so the website can no longer be viewed as them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
