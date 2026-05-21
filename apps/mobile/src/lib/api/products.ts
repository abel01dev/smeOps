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
}

export const productsApi = {
  list: (params?: ListProductsParams) =>
    apiClient
      .get<PaginatedResult<Product>>("/products", { params })
      .then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (body: CreateProductInput) =>
    apiClient.post<Product>("/products", body).then((r) => r.data),
  update: (id: string, body: UpdateProductInput) =>
    apiClient.patch<Product>(`/products/${id}`, body).then((r) => r.data),
  archive: (id: string) =>
    apiClient.delete<Product>(`/products/${id}`).then((r) => r.data),
};
