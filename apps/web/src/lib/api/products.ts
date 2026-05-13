"use client";

import type {
  CreateProductInput,
  PaginatedResult,
  Product,
  ProductListQuery,
  UpdateProductInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export interface ListProductsParams extends Partial<ProductListQuery> {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const productsApi = {
  list: (params: ListProductsParams = {}) =>
    apiClient
      .get<PaginatedResult<Product>>("/products", { params })
      .then((r) => r.data),
  findOne: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (input: CreateProductInput) =>
    apiClient.post<Product>("/products", input).then((r) => r.data),
  update: (id: string, input: UpdateProductInput) =>
    apiClient.patch<Product>(`/products/${id}`, input).then((r) => r.data),
  archive: (id: string) =>
    apiClient.delete<Product>(`/products/${id}`).then((r) => r.data),
};
