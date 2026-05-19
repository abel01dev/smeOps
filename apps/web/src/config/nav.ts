import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Receipt,
  ScanLine,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown on placeholder pages until that day ships. */
  dayNote?: string;
}

export const APP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS", icon: ScanLine },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/customers", label: "Customers", icon: Users, dayNote: "Day 10" },
  { href: "/sales", label: "Sales", icon: Receipt, dayNote: "Day 10" },
];
