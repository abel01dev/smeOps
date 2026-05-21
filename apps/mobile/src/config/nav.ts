import type { AppRole } from "@sme/shared";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  ScanLine,
  User,
  Users,
} from "lucide-react-native";

export interface MobileTabItem {
  name: string;
  titleKey: string;
  icon: typeof LayoutDashboard;
  roles: AppRole[];
}

export const OWNER_MANAGER_TABS: MobileTabItem[] = [
  {
    name: "dashboard",
    titleKey: "nav.dashboard",
    icon: LayoutDashboard,
    roles: ["OWNER", "MANAGER"],
  },
  {
    name: "assistant",
    titleKey: "nav.assistant",
    icon: MessageSquare,
    roles: ["OWNER", "MANAGER"],
  },
  {
    name: "sales",
    titleKey: "nav.sales",
    icon: Receipt,
    roles: ["OWNER", "MANAGER"],
  },
  {
    name: "profile",
    titleKey: "common.accountOverview",
    icon: User,
    roles: ["OWNER", "MANAGER"],
  },
];

export const CASHIER_TABS: MobileTabItem[] = [
  {
    name: "customers",
    titleKey: "nav.customers",
    icon: Users,
    roles: ["CASHIER"],
  },
  {
    name: "sales",
    titleKey: "nav.sales",
    icon: Receipt,
    roles: ["CASHIER"],
  },
];

export const POS_FAB_ROLES: AppRole[] = ["OWNER", "MANAGER", "CASHIER"];

export { ScanLine, Package };
