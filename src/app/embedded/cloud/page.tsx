import type { Metadata } from "next";
import { CumuloraDemo, CUMULORA_BRAND } from "@/components/embedded/CumuloraDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Cumulora — price your data platform",
  description:
    "A mock pricing page that re-prices itself from a SurveyJS configurator, opened on what the CRM already knows about the account.",
};

/**
 * Embedded demo: a pricing page driven by the survey, and a survey opened on the
 * account record.
 */
export default function EmbeddedCloudPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(CUMULORA_BRAND) }} />
      <CumuloraDemo survey={DEMO_SURVEYS.cloudPlatform} />
    </>
  );
}
