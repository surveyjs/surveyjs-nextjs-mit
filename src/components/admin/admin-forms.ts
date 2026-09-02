import {
  checkoutSample,
  clinicVisitSample,
  cloudPlatformSample,
  customerSatisfactionSample,
  getSchemaDefinition,
  medicalFormSample,
  type SurveyData,
  type SurveyJSON,
} from "@/schemas";
import {
  CADENCE_USER,
  CUMULORA_USER,
  RIDGELINE_USER,
  type DemoUser,
} from "@/components/embedded/demo-accounts";

/**
 * Every form in the template, in one list, because the admin edits all of them.
 *
 * The template used to carry a `/configure` page per form and a JSON panel inside
 * each embedded demo — four editors for the same job. There is now one: `/admin`,
 * which is also the URL worth sharing, because it is where a visitor sees the
 * three things the library is bought for at once — the definition, the people it
 * is rendered for, and the form that comes out.
 *
 * `user` is what separates the two halves of the list. The three admin forms are
 * plain: one definition, one form. The three embedded ones are rendered *for
 * somebody* — their JSON reads `{user.something}` — so those get the users pane
 * and a preview that opens the host site as the selected user.
 */
export interface AdminForm {
  /** The schema id, and the `?form=` value that makes the URL shareable. */
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly json: SurveyJSON;
  /** Answers behind the preview's Prefill, where the form has a sample. */
  readonly prefill?: SurveyData;
  /** Set when the form is rendered per user — the embedded demos. */
  readonly user?: DemoUser;
  /** Where the form itself lives, and what the primary button opens. */
  readonly href: string;
  /** The primary button's label: the honest verb for where it lands. */
  readonly previewLabel: string;
  /** True when `href` is somebody else's website rather than this shell. */
  readonly embedded: boolean;
  /** The definition in the repository, for anyone who wants the real file. */
  readonly sourceHref: string;
}

const SOURCE_ROOT =
  "https://github.com/surveyjs/surveyjs-nextjs-mit/blob/main/src/schemas";

function form(
  id: string,
  file: string,
  rest: Omit<AdminForm, "id" | "json" | "sourceHref">,
): AdminForm {
  return {
    id,
    json: getSchemaDefinition(id).json,
    sourceHref: `${SOURCE_ROOT}/${file}`,
    ...rest,
  };
}

export const ADMIN_FORMS: readonly AdminForm[] = [
  form("medical-form", "medical-form.ts", {
    label: "Claims intake",
    hint: "The patient-intake form on this admin's own Claims page.",
    prefill: medicalFormSample,
    href: "/claims",
    previewLabel: "Save and quit",
    embedded: false,
  }),
  form("checkout", "checkout.ts", {
    label: "Checkout",
    hint: "A multi-step checkout wizard, validated page by page.",
    prefill: checkoutSample,
    href: "/checkout",
    previewLabel: "Save and quit",
    embedded: false,
  }),
  form("insurance-claim", "insurance-claim.ts", {
    label: "Claim record",
    hint: "The editor behind every row on the Records page.",
    href: "/records",
    previewLabel: "Save and quit",
    embedded: false,
  }),
  form("customer-satisfaction", "customer-satisfaction.ts", {
    label: "Satisfaction survey",
    hint: "Embedded in a product site, addressed to the signed-in account.",
    prefill: customerSatisfactionSample,
    user: CADENCE_USER,
    href: "/embedded/feedback",
    previewLabel: "Preview result",
    embedded: true,
  }),
  form("cloud-platform", "cloud-platform.ts", {
    label: "Platform configurator",
    hint: "Embedded in a pricing page it re-prices as it is answered.",
    prefill: cloudPlatformSample,
    user: CUMULORA_USER,
    href: "/embedded/cloud",
    previewLabel: "Preview result",
    embedded: true,
  }),
  form("clinic-visit", "clinic-visit.ts", {
    label: "Appointment request",
    hint: "Embedded in a clinic site, filled in from the patient's chart.",
    prefill: clinicVisitSample,
    user: RIDGELINE_USER,
    href: "/embedded/clinic",
    previewLabel: "Preview result",
    embedded: true,
  }),
] as const;

export const DEFAULT_ADMIN_FORM_ID = ADMIN_FORMS[0].id;

/** The form `?form=` names, falling back to the first rather than throwing. */
export function getAdminForm(id: string | null | undefined): AdminForm {
  return ADMIN_FORMS.find((item) => item.id === id) ?? ADMIN_FORMS[0];
}
