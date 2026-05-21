import { z } from "zod";

import type { PaginatedResult } from "./pagination.schema";
import { paginationQuerySchema } from "./pagination.schema";

export const expenseCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(80),
});

export const createExpenseCategorySchema = expenseCategorySchema;
export const updateExpenseCategorySchema = expenseCategorySchema.partial();

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>;
export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>;

export interface ExpenseCategory {
  id: string;
  name: string;
  expenseCount?: number;
  createdAt: string;
  updatedAt: string;
}

const paymentMethodSchema = z.enum(["CASH", "MOBILE_MONEY", "CARD"]);

export const createOperationalExpenseSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? String(v) : v.trim()))
    .pipe(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a positive number")
        .refine((s) => parseFloat(s) > 0, "Amount must be greater than zero"),
    ),
  description: z.string().trim().max(200).optional().nullable(),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  paymentMethod: paymentMethodSchema.default("CASH"),
  note: z.string().trim().max(500).optional().nullable(),
});

export const updateOperationalExpenseSchema =
  createOperationalExpenseSchema.partial();

export type CreateOperationalExpenseInput = z.infer<
  typeof createOperationalExpenseSchema
>;
export type UpdateOperationalExpenseInput = z.infer<
  typeof updateOperationalExpenseSchema
>;

export interface OperationalExpense {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: string;
  description: string | null;
  expenseDate: string;
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD";
  note: string | null;
  recordedById: string;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
}

export const expenseListQuerySchema = paginationQuerySchema.merge(
  z.object({
    search: z.string().trim().max(120).optional(),
    categoryId: z.string().optional(),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  }),
);

export type ExpenseListQuery = z.infer<typeof expenseListQuerySchema>;

/** Paginated expenses plus sum of all rows matching the date filter (not just current page). */
export interface ExpenseListResult extends PaginatedResult<OperationalExpense> {
  periodTotal: string;
}
