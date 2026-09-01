export type NavId =
  | "claims"
  | "checkout"
  | "records"
  | "embeddedFeedback"
  | "embeddedCloud"
  | "embeddedClinic";

export interface NavItem {
  readonly id: NavId;
  readonly label: string;
  readonly path: string;
  readonly description: string;
  readonly schemaId: string;
  /**
   * Open the route in a new browser tab instead of inside the admin shell. The
   * embedded demos pretend to be somebody else's website, so they can't be
   * framed by this template's chrome without losing the whole point.
   */
  readonly openInNewTab?: boolean;
}

export const navItems: readonly NavItem[] = [
  {
    id: "claims",
    label: "Claims",
    path: "/claims",
    description: "Patient intake / medical-insurance form.",
    schemaId: "medical-form",
  },
  {
    id: "checkout",
    label: "Checkout",
    path: "/checkout",
    description: "Multi-step checkout wizard.",
    schemaId: "checkout",
  },
  {
    id: "records",
    label: "Records",
    path: "/records",
    description: "Browse and edit insurance-claim records.",
    schemaId: "insurance-claim",
  },
  {
    id: "embeddedFeedback",
    label: "Embedded: Give feedback",
    path: "/embedded/feedback",
    description: "A satisfaction survey inside a product marketing site, addressed to the signed-in user.",
    schemaId: "customer-satisfaction",
    openInNewTab: true,
  },
  {
    id: "embeddedCloud",
    label: "Embedded: Cloud Platform",
    path: "/embedded/cloud",
    description: "A pricing page whose configurator opens on the account's own numbers.",
    schemaId: "cloud-platform",
    openInNewTab: true,
  },
  {
    id: "embeddedClinic",
    label: "Embedded: Family clinic",
    path: "/embedded/clinic",
    description:
      "A US clinic page whose appointment form arrives already filled from the patient's chart.",
    schemaId: "clinic-visit",
    openInNewTab: true,
  },
] as const;

export function getNavItem(id: NavId): NavItem {
  const item = navItems.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown nav id: ${id}`);
  return item;
}

export function isActiveRoute(pathname: string, routePath: string): boolean {
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}
