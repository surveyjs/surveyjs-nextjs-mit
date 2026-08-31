"use client";

import { useEffect, useMemo } from "react";
import { Survey } from "survey-react-ui";
import type { Model } from "survey-core";
import { createSurveyModel, type SurveyData, type SurveyJSON } from "@/schemas";
import { cn } from "@/lib/utils";

import "survey-core/survey-core.css";
import "survey-core/themes/adapters/shadcn-base-nova.css";
import "@/styles/survey-overrides-shadcn.css";
import "@/styles/survey-overrides-base-nova.css";

/**
 * The survey as a host site embeds it: no admin chrome, no page header, and no
 * wrapper of its own beyond the card the host page would have used anyway.
 *
 * Every placement in every demo renders this same component with the same JSON —
 * the only difference between "inline section" and "floating widget" is which
 * container it is mounted in, and swapping the definition in the toolbar changes
 * nothing here either.
 *
 * `onDataChange` is what lets a host page price itself from the answers as they
 * are given. It fires for plain answers, dynamic-panel edits and matrix cells,
 * and once on mount so a prefilled model does not look empty to the page.
 */
export function EmbeddedSurvey({
  json,
  data,
  onDataChange,
  onComplete,
}: {
  json: SurveyJSON;
  /** Prefilled answers. A new object remounts the model, which "Reset" wants. */
  data?: SurveyData;
  onDataChange?: (data: SurveyData) => void;
  onComplete?: (data: SurveyData) => void;
}) {
  const model = useMemo(() => createSurveyModel(json, { data }), [json, data]);

  useEffect(() => {
    if (!onDataChange) return;
    const emit = (sender: Model) => onDataChange({ ...sender.data });

    // One handler, five events: survey-core reports a dynamic panel's rows and a
    // matrix's cells through their own events, not through onValueChanged, and a
    // quote that ignored them would sit stale while the visitor typed.
    const onValue = (sender: Model) => emit(sender);
    model.onValueChanged.add(onValue);
    model.onDynamicPanelValueChanged.add(onValue);
    model.onDynamicPanelAdded.add(onValue);
    model.onDynamicPanelRemoved.add(onValue);
    model.onMatrixCellValueChanged.add(onValue);
    emit(model);

    return () => {
      model.onValueChanged.remove(onValue);
      model.onDynamicPanelValueChanged.remove(onValue);
      model.onDynamicPanelAdded.remove(onValue);
      model.onDynamicPanelRemoved.remove(onValue);
      model.onMatrixCellValueChanged.remove(onValue);
    };
  }, [model, onDataChange]);

  useEffect(() => {
    if (!onComplete) return;
    const handler = (sender: Model) => onComplete({ ...sender.data });
    model.onComplete.add(handler);
    return () => model.onComplete.remove(handler);
  }, [model, onComplete]);

  return <Survey model={model} />;
}

/** The container a host page puts a form in — a plain shadcn card. */
export function SurveyCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("bg-card overflow-hidden rounded-xl border shadow-sm", className)}>
      {children}
    </div>
  );
}
