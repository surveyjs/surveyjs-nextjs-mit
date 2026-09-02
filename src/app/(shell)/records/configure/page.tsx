import { redirect } from "next/navigation";
import { getNavItem } from "@/schemas";

const nav = getNavItem("records");

/**
 * Kept as a redirect, because links to it are already out in the world.
 *
 * Every form in the template is now edited in one place — `/admin`, opened on
 * this form. Three per-form editors meant three places to explain, and the
 * definition, the user it is rendered for and the result were never on screen
 * together.
 */
export default function ConfigureRedirect() {
  redirect(`/admin?form=${nav.schemaId}`);
}
