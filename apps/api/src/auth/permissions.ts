import { UserRole } from "@prisma/client";

/** Roles allowed per API resource — extend here as features grow. */
export const API_ROLE_ACCESS = {
  dashboard: [UserRole.OWNER, UserRole.MANAGER],
  aiInsights: [UserRole.OWNER, UserRole.MANAGER],
  aiAssistant: [UserRole.OWNER, UserRole.MANAGER],
  categoriesRead: [UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER],
  categoriesWrite: [UserRole.OWNER, UserRole.MANAGER],
  productsRead: [UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER],
  productsWrite: [UserRole.OWNER, UserRole.MANAGER],
  customersRead: [UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER],
  customersWrite: [UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER],
  customersDelete: [UserRole.OWNER, UserRole.MANAGER],
  sales: [UserRole.OWNER, UserRole.MANAGER, UserRole.CASHIER],
} as const satisfies Record<string, UserRole[]>;
