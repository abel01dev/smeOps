"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateCategoryInput,
  CreateProductInput,
  UpdateCategoryInput,
  UpdateProductInput,
} from "@sme/shared";

import type { ListProductsParams } from "@/lib/api/products";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";

const PRODUCTS_KEY = ["products"] as const;
const CATEGORIES_KEY = ["categories"] as const;
const DASHBOARD_KEY = ["dashboard"] as const;

export function useProductsList(params: ListProductsParams) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, "list", params],
    queryFn: () => productsApi.list(params),
    staleTime: 15_000,
    placeholderData: (previous) => previous,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: () => categoriesApi.list(),
    staleTime: 30_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productsApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useArchiveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.archive(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => categoriesApi.create(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      categoriesApi.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
