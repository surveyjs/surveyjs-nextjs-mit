import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminWorkbench } from "@/components/admin/AdminWorkbench";

export const metadata: Metadata = {
  title: "Survey admin — SurveyJS Library + Next.js",
  description:
    "Edit any form in the template as JSON, choose the user it is rendered for, and open the result where the form actually lives.",
};

/**
 * The one editor in the template, for every form in it.
 *
 * `?form=` picks which one, so a link to a particular form is shareable; the
 * workbench reads it with `useSearchParams`, hence the Suspense boundary.
 */
export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminWorkbench />
    </Suspense>
  );
}
