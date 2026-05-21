import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
} from "@sme/shared";

import { categoriesApi } from "@/lib/api/categories";
import { productsApi, type ListProductsParams } from "@/lib/api/products";

export function useProductsList(params: ListProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.list(params),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductInput) => productsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateProductInput }) =>
      productsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useArchiveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.archive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCategoryInput) => categoriesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryInput }) =>
      categoriesApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
