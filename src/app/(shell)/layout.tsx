import type { ReactNode } from "react";
import { AdminShell } from "@/components/AdminShell";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
