import { redirect } from "next/navigation";
import { getNavItem } from "@/schemas";

const nav = getNavItem("checkout");

/**
 * Kept as a redirect, because links to it are already out in the world.
 *
 * Every form in the template is now edited in one place — `/configure`, opened
 * on this form. Three per-form editors meant three places to explain, and none of
 * them covered the embedded demos.
 */
export default function ConfigureRedirect() {
  redirect(`/configure?form=${nav.schemaId}`);
}
