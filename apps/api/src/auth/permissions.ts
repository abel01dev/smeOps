import { UserRole } from "@prisma/client";

const O = UserRole.OWNER;
const M = UserRole.MANAGER;
const I = UserRole.INVENTORY_MANAGER;
const C = UserRole.CASHIER;

/** Roles allowed per API resource — extend here as features grow. */
export const API_ROLE_ACCESS = {
  dashboard: [O, M],
  aiInsights: [O, M],
  aiAssistant: [O, M],
  categoriesRead: [O, M, C, I],
  categoriesWrite: [O, M, I],
  productsRead: [O, M, C, I],
  productsWrite: [O, M, I],
  customersRead: [O, M, C],
  customersWrite: [O, M, C],
  customersDelete: [O, M],
  sales: [O, M, C],
  employees: [O],
} as const satisfies Record<string, UserRole[]>;
