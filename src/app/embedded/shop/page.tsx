import type { Metadata } from "next";
import { NorthmillDemo, NORTHMILL_BRAND } from "@/components/embedded/NorthmillDemo";
import { DEMO_SURVEYS } from "@/components/embedded/demo-surveys";
import { brandBootScript } from "@/components/embedded/demo-controls";

export const metadata: Metadata = {
  title: "Northmill Coffee — find your bag",
  description:
    "A mock storefront where a five-question SurveyJS quiz picks the coffee, the grind, the bag size and the delivery schedule, and the checkout drives the order summary.",
};

/**
 * Embedded demo: the most familiar page on the internet, with the survey
 * choosing what is on it.
 *
 * Two definitions, and the toolbar's switcher moves between the store's two
 * screens rather than swapping forms in one slot: the finder on the product page,
 * the checkout in the cart.
 */
export default function EmbeddedShopPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: brandBootScript(NORTHMILL_BRAND) }} />
      <NorthmillDemo surveys={[DEMO_SURVEYS.coffeeFinder, DEMO_SURVEYS.checkout]} />
    </>
  );
}
