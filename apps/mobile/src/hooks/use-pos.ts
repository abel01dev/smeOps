import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesApi } from "@/lib/api/categories";
import { customersApi } from "@/lib/api/customers";
import { productsApi } from "@/lib/api/products";
import { salesApi } from "@/lib/api/sales";

export function usePosProducts(search: string, categoryId?: string) {
  return useQuery({
    queryKey: ["pos", "products", search, categoryId],
    queryFn: () =>
      productsApi.list({
        search: search || undefined,
        categoryId,
        status: "ACTIVE",
        pageSize: 50,
      }),
  });
}

export function usePosCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });
}

export function usePosCustomers(search: string) {
  return useQuery({
    queryKey: ["pos", "customers", search],
    queryFn: () =>
      customersApi.list({ search: search || undefined, pageSize: 20 }),
    enabled: search.length >= 1,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: salesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
