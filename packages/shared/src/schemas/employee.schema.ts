import { z } from "zod";

/** Roles the owner can assign when inviting employees (not OWNER). */
export const EMPLOYEE_INVITE_ROLES = [
  "MANAGER",
  "INVENTORY_MANAGER",
  "CASHIER",
] as const;

export type EmployeeInviteRole = (typeof EMPLOYEE_INVITE_ROLES)[number];

export const createEmployeeSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address"),
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80),
  role: z.enum(EMPLOYEE_INVITE_ROLES),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const updateEmployeeRoleSchema = z.object({
  role: z.enum(EMPLOYEE_INVITE_ROLES),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeRoleInput = z.infer<typeof updateEmployeeRoleSchema>;

export interface EmployeeSummary {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "INVENTORY_MANAGER" | "CASHIER";
  createdAt: string;
}
