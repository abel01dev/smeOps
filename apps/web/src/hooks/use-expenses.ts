"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateExpenseCategoryInput,
  CreateOperationalExpenseInput,
  UpdateExpenseCategoryInput,
  UpdateOperationalExpenseInput,
} from "@sme/shared";

import type { ListExpensesParams } from "@/lib/api/expenses";
import { expenseCategoriesApi, expensesApi } from "@/lib/api/expenses";

const EXPENSES_KEY = ["expenses"] as const;
const CATEGORIES_KEY = ["expense-categories"] as const;

export function useExpenseCategories(enabled = true) {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => expenseCategoriesApi.list(),
    staleTime: 60_000,
    enabled,
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseCategoryInput) =>
      expenseCategoriesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useUpdateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateExpenseCategoryInput;
    }) => expenseCategoriesApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      void qc.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
  });
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseCategoriesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useExpensesList(params: ListExpensesParams) {
  return useQuery({
    queryKey: [...EXPENSES_KEY, "list", params],
    queryFn: () => expensesApi.list(params),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOperationalExpenseInput) =>
      expensesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateOperationalExpenseInput;
    }) => expensesApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EXPENSES_KEY });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
