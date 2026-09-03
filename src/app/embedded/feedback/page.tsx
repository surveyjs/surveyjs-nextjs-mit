import type { Metadata } from "next";
import { CadenceDemo, CADENCE_BRAND } from "@/components/embedded/feedback/CadenceDemo";
import { DEMO_SURVEYS } from "@/components/embedded/shared/demo-surveys";
import { brandBootScript } from "@/components/embedded/shared/demo-controls";

export const metadata: Metadata = {
  title: "Cadence — tell us how we are doing",
  description:
    "A mock product site whose hero hosts a SurveyJS satisfaction survey, rendered for the signed-in account: greeted by name, with the questions that fit their plan and how long they have been a customer.",
};

/**
 * Embedded demo: a satisfaction survey in a product site's hero, addressed to
 * whoever is signed in.
 */
export default function EmbeddedFeedbackPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(CADENCE_BRAND) }} />
      <CadenceDemo survey={DEMO_SURVEYS.satisfaction} />
    </>
  );
}
