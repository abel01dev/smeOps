"use client";

import type {
  CreateExpenseCategoryInput,
  CreateOperationalExpenseInput,
  ExpenseCategory,
  ExpenseListResult,
  OperationalExpense,
  UpdateExpenseCategoryInput,
  UpdateOperationalExpenseInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export interface ListExpensesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}

export const expenseCategoriesApi = {
  list: () =>
    apiClient
      .get<ExpenseCategory[]>("/expense-categories")
      .then((r) => r.data),
  create: (input: CreateExpenseCategoryInput) =>
    apiClient
      .post<ExpenseCategory>("/expense-categories", input)
      .then((r) => r.data),
  update: (id: string, input: UpdateExpenseCategoryInput) =>
    apiClient
      .patch<ExpenseCategory>(`/expense-categories/${id}`, input)
      .then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/expense-categories/${id}`).then((r) => r.data),
};

export const expensesApi = {
  list: (params: ListExpensesParams) =>
    apiClient
      .get<ExpenseListResult>("/expenses", { params })
      .then((r) => r.data),

  findOne: (id: string) =>
    apiClient.get<OperationalExpense>(`/expenses/${id}`).then((r) => r.data),

  create: (input: CreateOperationalExpenseInput) =>
    apiClient
      .post<OperationalExpense>("/expenses", input)
      .then((r) => r.data),

  update: (id: string, input: UpdateOperationalExpenseInput) =>
    apiClient
      .patch<OperationalExpense>(`/expenses/${id}`, input)
      .then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/expenses/${id}`).then((r) => r.data),
};
