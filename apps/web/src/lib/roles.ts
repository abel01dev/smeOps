import {
  canAccessRoute,
  DEFAULT_ROUTE_BY_ROLE,
  ROUTE_ACCESS,
  type AppRole,
} from "@sme/shared";

export type { AppRole };
export { ROUTE_ACCESS, DEFAULT_ROUTE_BY_ROLE, canAccessRoute };

export function navItemsForRole(role: AppRole): string[] {
  return Object.entries(ROUTE_ACCESS)
    .filter(([, roles]) => roles.includes(role))
    .map(([href]) => href);
}

export function roleLabelKey(role: AppRole): string {
  return `roles.${role.toLowerCase()}`;
}
