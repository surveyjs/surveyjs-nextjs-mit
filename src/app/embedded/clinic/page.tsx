import type { Metadata } from "next";
import { RidgelineDemo, RIDGELINE_BRAND } from "@/components/embedded/RidgelineDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Ridgeline Family Health — request an appointment",
  description:
    "A mock US clinic page whose SurveyJS appointment request estimates the copay, flags a needed referral and builds the what-to-bring list as it is answered.",
};

/**
 * Embedded demo: a US primary-care site.
 *
 * The short public request form opens the page; the toolbar also carries the full
 * new-patient intake, which is the other half of how a real clinic collects
 * information.
 */
export default function EmbeddedClinicPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(RIDGELINE_BRAND) }} />
      <RidgelineDemo surveys={[DEMO_SURVEYS.clinicVisit, DEMO_SURVEYS.patientIntake]} />
    </>
  );
}
