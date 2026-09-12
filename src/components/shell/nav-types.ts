import type { CategorySlug } from "@/registry/types";

export interface NavItem {
  slug: string;
  name: string;
  pro: boolean;
  /** Number of color variants for this component (0 = none) */
  variants: number;
}

export interface NavGroup {
  slug: CategorySlug;
  label: string;
  description: string;
  items: NavItem[];
}

export const OPEN_COMMAND_EVENT = "anutkinui:open-command";

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
}
