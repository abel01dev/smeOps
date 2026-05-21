import type { AuthUser } from "./schemas/auth.schema";

export type AppRole = AuthUser["role"];

export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  "/dashboard": ["OWNER", "MANAGER"],
  "/assistant": ["OWNER", "MANAGER"],
  "/pos": ["OWNER", "MANAGER", "CASHIER"],
  "/inventory": ["OWNER", "MANAGER", "INVENTORY_MANAGER"],
  "/customers": ["OWNER", "MANAGER", "CASHIER"],
  "/sales": ["OWNER", "MANAGER", "CASHIER"],
  "/team": ["OWNER"],
};

export const DEFAULT_ROUTE_BY_ROLE: Record<AppRole, string> = {
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  INVENTORY_MANAGER: "/inventory",
  CASHIER: "/pos",
};

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  const base = Object.keys(ROUTE_ACCESS).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!base) return true;
  return ROUTE_ACCESS[base]?.includes(role) ?? false;
}

export function roleHomeSegment(role: AppRole): string {
  switch (role) {
    case "OWNER":
    case "MANAGER":
      return "(owner-manager)";
    case "CASHIER":
      return "(cashier)";
    case "INVENTORY_MANAGER":
      return "(inventory)";
    default:
      return "(owner-manager)";
  }
}

/** Expo Router path after login (must match a real screen file). */
export function roleMobileHomeRoute(role: AppRole): string {
  switch (role) {
    case "OWNER":
    case "MANAGER":
      return "/(app)/(owner-manager)/dashboard";
    case "CASHIER":
      return "/(app)/(cashier)/customers";
    case "INVENTORY_MANAGER":
      return "/(app)/(inventory)";
    default:
      return "/(app)/(owner-manager)/dashboard";
  }
}
