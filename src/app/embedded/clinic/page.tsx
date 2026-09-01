import type { Metadata } from "next";
import { RidgelineDemo, RIDGELINE_BRAND } from "@/components/embedded/RidgelineDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Ridgeline Family Health — request an appointment",
  description:
    "A mock US clinic page whose SurveyJS appointment request arrives filled in from the patient's chart, estimates the copay and flags a needed referral as it is answered.",
};

/**
 * Embedded demo: a US primary-care site whose public request form is rendered
 * from the signed-in patient's portal record.
 */
export default function EmbeddedClinicPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(RIDGELINE_BRAND) }} />
      <RidgelineDemo survey={DEMO_SURVEYS.clinicVisit} />
    </>
  );
}
