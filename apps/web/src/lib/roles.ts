import type { AuthUser } from "@sme/shared";

export type AppRole = AuthUser["role"];

export const ROUTE_ACCESS: Record<string, AppRole[]> = {
  "/dashboard": ["OWNER", "MANAGER"],
  "/assistant": ["OWNER", "MANAGER"],
  "/pos": ["OWNER", "MANAGER", "CASHIER"],
  "/inventory": ["OWNER", "MANAGER"],
  "/customers": ["OWNER", "MANAGER", "CASHIER"],
  "/sales": ["OWNER", "MANAGER", "CASHIER"],
};

export const DEFAULT_ROUTE_BY_ROLE: Record<AppRole, string> = {
  OWNER: "/dashboard",
  MANAGER: "/dashboard",
  CASHIER: "/pos",
};

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  const base = Object.keys(ROUTE_ACCESS).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!base) return true;
  return ROUTE_ACCESS[base]?.includes(role) ?? false;
}

export function navItemsForRole(role: AppRole): string[] {
  return Object.entries(ROUTE_ACCESS)
    .filter(([, roles]) => roles.includes(role))
    .map(([href]) => href);
}

export function roleLabelKey(role: AppRole): string {
  return `roles.${role.toLowerCase()}`;
}
