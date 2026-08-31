import type { Metadata } from "next";
import { CumuloraDemo } from "@/components/embedded/CumuloraDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { DEFAULT_BRAND_ID, brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Cumulora — price your data platform",
  description:
    "A mock pricing page that re-prices itself from a SurveyJS configurator: tier, modules, environments, storage, support and compliance.",
};

/**
 * Embedded demo: a pricing page driven by the survey.
 *
 * Only one definition is offered here — the configurator is what the page is
 * built around, and the other demos' surveys would have nothing to price.
 */
export default function EmbeddedCloudPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(DEFAULT_BRAND_ID) }} />
      <CumuloraDemo surveys={[DEMO_SURVEYS.cloudPlatform]} />
    </>
  );
}
