"use client";

import { useEffect, useMemo } from "react";
import { Survey } from "survey-react-ui";
import { createSurveyModel, type SurveyData, type SurveyJSON } from "@/schemas";
import { cn } from "@/lib/utils";

import "survey-core/survey-core.css";
import "survey-core/themes/adapters/shadcn-base-nova.css";
import "@/styles/survey-overrides-shadcn.css";
import "@/styles/survey-overrides-base-nova.css";

/**
 * The survey as the mock site embeds it: no admin chrome, no page header, and
 * no wrapper of its own beyond the card the host page would have used anyway.
 *
 * Every placement in the demo renders this same component with the same JSON —
 * the only difference between "inline section" and "floating widget" is which
 * container it is mounted in, and switching the definition in the toolbar
 * changes nothing here either.
 */
export function EmbeddedSurvey({
  json,
  data,
  onComplete,
}: {
  json: SurveyJSON;
  /** Prefilled answers. A new object remounts the model, which is what "Reset" wants. */
  data?: SurveyData;
  onComplete?: (data: SurveyData) => void;
}) {
  const model = useMemo(() => createSurveyModel(json, { data }), [json, data]);

  useEffect(() => {
    if (!onComplete) return;
    const handler = (sender: typeof model) => onComplete(sender.data);
    model.onComplete.add(handler);
    return () => model.onComplete.remove(handler);
  }, [model, onComplete]);

  return <Survey model={model} />;
}

/** The container the host page puts a form in — a plain shadcn card. */
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
