import type { Metadata } from "next";
import { ChartDemo, CHART_BRAND } from "@/components/embedded/ChartDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Ridgeline Chart — encounter note",
  description:
    "A clinician's workspace whose whole screen is one SurveyJS survey: eight pages, dynamic matrices with totals, calculated scores, file and camera capture, and a signed attestation.",
};

/**
 * Embedded demo: an internal clinical workspace, where the survey is the app.
 */
export default function EmbeddedChartPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(CHART_BRAND) }} />
      <ChartDemo survey={DEMO_SURVEYS.encounterNote} />
    </>
  );
}
