import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClinicAdminShell } from "@/components/clinic-admin/ClinicAdminShell";

export const metadata: Metadata = {
  title: "Ridgeline Admin Portal",
  description:
    "The clinic's back office: patient charts, and the appointment form its website renders — a JSON definition with a live preview.",
};

/**
 * The clinic demo's own back office, outside the template's admin chrome.
 *
 * It is a separate shell because it is pretending to be a different product: the
 * practice's software, with the practice's branding, from which the public site
 * is one link away.
 */
export default function ClinicAdminLayout({ children }: { children: ReactNode }) {
  return <ClinicAdminShell>{children}</ClinicAdminShell>;
}
