import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  ScanLine,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";

import type { AppRole } from "@/lib/roles";
import { ROUTE_ACCESS } from "@/lib/roles";

export interface NavItem {
  href: string;
  labelKey:
    | "dashboard"
    | "assistant"
    | "pos"
    | "inventory"
    | "customers"
    | "sales"
    | "team"
    | "expenses";
  icon: LucideIcon;
  roles: AppRole[];
}

export const APP_NAV: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "dashboard",
    icon: LayoutDashboard,
    roles: ROUTE_ACCESS["/dashboard"],
  },
  {
    href: "/assistant",
    labelKey: "assistant",
    icon: MessageSquare,
    roles: ROUTE_ACCESS["/assistant"],
  },
  {
    href: "/pos",
    labelKey: "pos",
    icon: ScanLine,
    roles: ROUTE_ACCESS["/pos"],
  },
  {
    href: "/inventory",
    labelKey: "inventory",
    icon: Package,
    roles: ROUTE_ACCESS["/inventory"],
  },
  {
    href: "/team",
    labelKey: "team",
    icon: UserCog,
    roles: ROUTE_ACCESS["/team"],
  },
  {
    href: "/expenses",
    labelKey: "expenses",
    icon: Wallet,
    roles: ROUTE_ACCESS["/expenses"],
  },
  {
    href: "/customers",
    labelKey: "customers",
    icon: Users,
    roles: ROUTE_ACCESS["/customers"],
  },
  {
    href: "/sales",
    labelKey: "sales",
    icon: Receipt,
    roles: ROUTE_ACCESS["/sales"],
  },
];

export function navForRole(role: AppRole): NavItem[] {
  return APP_NAV.filter((item) => item.roles.includes(role));
}
