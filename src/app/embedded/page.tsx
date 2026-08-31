import type { Metadata } from "next";
import {
  customerSatisfactionSample,
  getNavItem,
  getSchemaDefinition,
  planFinderSample,
} from "@/schemas";
import { EmbeddedDemo } from "@/components/embedded/EmbeddedDemo";
import {
  DEFAULT_BRAND_ID,
  brandBootScript,
  type DemoSurvey,
} from "@/components/embedded/demo-controls";

const nav = getNavItem("embedded");

export const metadata: Metadata = {
  title: "Cadence — plan the week, ship the quarter",
  description:
    "A mock product site hosting a SurveyJS plan finder inline, in a modal, in a drawer and as a floating widget.",
};

/**
 * Two definitions, so the toolbar can prove the point the demo is making: the
 * embedding does not know or care which survey it is holding. The first one is
 * the default, and the nav entry decides which that is.
 */
const surveys: readonly DemoSurvey[] = [
  {
    id: nav.schemaId,
    label: "Plan finder",
    hint: "Recommends a plan and modules from the answers. The form a marketing page would really carry.",
    json: getSchemaDefinition(nav.schemaId).json,
    prefill: planFinderSample,
  },
  {
    id: "customer-satisfaction",
    label: "Satisfaction survey",
    hint: "The classic CSAT, in the same slot — same embedding, different JSON.",
    json: getSchemaDefinition("customer-satisfaction").json,
    prefill: customerSatisfactionSample,
  },
];

/**
 * The embedded demo lives outside the `(shell)` route group, so it renders
 * without this template's sidebar and header: a survey that is meant to look
 * native inside somebody else's site cannot be shown inside our own frame.
 *
 * The survey itself is server-rendered here, exactly like the forms on the
 * other pages — view source and the questions are in the HTML.
 */
export default function EmbeddedPage() {
  return (
    <>
      {/* Sets the host site's brand colour while the HTML is still parsing, so
          the first painted frame is already branded. */}
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(DEFAULT_BRAND_ID) }} />
      <EmbeddedDemo surveys={surveys} />
    </>
  );
}
