import { Model } from "survey-core";
import type { SchemaDefinition, SurveyData, SurveyJSON, SurveyMode } from "./types";

export interface CreateSurveyModelOptions {
  /** Initial response data to load into the model. */
  data?: SurveyData;
  /**
   * Values published as survey variables, so the definition can read them with
   * `{name}` — in titles and HTML, in `visibleIf`, and in
   * `defaultValueExpression` to pre-answer a question.
   *
   * This is how a form arrives configured for the person in front of it: the
   * caller passes whatever the session or the CRM already knows, and the JSON
   * decides what to do with it. Set before `data`, because
   * `defaultValueExpression` is evaluated as the questions are created.
   */
  variables?: Readonly<Record<string, unknown>>;
  /** `edit` (default) for an interactive form, `display` for read-only. */
  mode?: SurveyMode;
  /** Locale code (e.g. "en", "fr"). Defaults to the survey's own locale. */
  locale?: string;
}

/** Accepts either a raw schema JSON or a {@link SchemaDefinition} wrapper. */
export type SchemaInput = SurveyJSON | SchemaDefinition;

function toJson(schema: SchemaInput): SurveyJSON {
  return "json" in schema && typeof (schema as SchemaDefinition).json === "object"
    ? (schema as SchemaDefinition).json
    : (schema as SurveyJSON);
}

/**
 * Build a configured `survey-core` {@link Model} from a schema (+ optional data
 * and mode). This is the single, renderer-agnostic factory every app uses — it
 * keeps model construction identical across the Bootstrap / shadcn / MUI hosts.
 *
 * The returned model is headless: apps render it with their own UI package.
 */
export function createSurveyModel(
  schema: SchemaInput,
  options: CreateSurveyModelOptions = {},
): Model {
  const { data, variables, mode = "edit", locale } = options;

  const model = new Model(toJson(schema));

  if (variables) {
    for (const [name, value] of Object.entries(variables)) {
      model.setVariable(name, value);
    }
  }

  model.mode = mode;

  model.applyTheme({ isPanelless: true });

  if (locale) {
    model.locale = locale;
  }

  if (data) {
    if (variables) {
      // Merge, so the answers a variable already pre-filled survive alongside
      // whatever the caller is loading — replacing would wipe them.
      model.mergeData(data);
    } else {
      // Replace rather than merge so each record loads cleanly.
      model.data = data;
    }
  }

  return model;
}
