import type { Metadata } from "next";
import { CadenceDemo } from "@/components/embedded/CadenceDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { DEFAULT_BRAND_ID, brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Cadence — tell us how we are doing",
  description:
    "A mock product site whose hero hosts a SurveyJS satisfaction survey, inline or in a modal, a drawer or a floating widget.",
};

/**
 * The same host site as `/embedded/product`, opened on the satisfaction survey
 * instead. Only the order of the definitions differs: the chrome treats the first
 * as the default, and the toolbar can still swap to the other one.
 */
export default function EmbeddedFeedbackPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(DEFAULT_BRAND_ID) }} />
      <CadenceDemo surveys={[DEMO_SURVEYS.satisfaction, DEMO_SURVEYS.planFinder]} />
    </>
  );
}
