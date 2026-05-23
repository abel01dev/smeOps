"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateSaleInput } from "@sme/shared";

import { categoriesApi } from "@/lib/api/categories";
import { customersApi } from "@/lib/api/customers";
import { productsApi } from "@/lib/api/products";
import { salesApi } from "@/lib/api/sales";

export function usePosProducts(search: string, categoryId?: string) {
  return useQuery({
    queryKey: ["pos", "products", search, categoryId],
    queryFn: () =>
      productsApi.list({
        status: "ACTIVE",
        search: search.trim() || undefined,
        categoryId,
        pageSize: 100,
        sortBy: "name",
        sortDir: "asc",
      }),
    staleTime: 20_000,
  });
}

export function usePosCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
    staleTime: 60_000,
  });
}

export function usePosCustomers(open: boolean, search: string) {
  return useQuery({
    queryKey: ["pos", "customers", search],
    queryFn: () =>
      customersApi.list({
        search: search.trim() || undefined,
        pageSize: 200,
        sortBy: "name",
        sortDir: "asc",
      }),
    staleTime: 30_000,
    enabled: open,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => salesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["products"] });
      void qc.invalidateQueries({ queryKey: ["pos"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
      void qc.invalidateQueries({ queryKey: ["sales"] });
      void qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
