"use client";

import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export const categoriesApi = {
  list: () => apiClient.get<Category[]>("/categories").then((r) => r.data),
  create: (input: CreateCategoryInput) =>
    apiClient.post<Category>("/categories", input).then((r) => r.data),
  update: (id: string, input: UpdateCategoryInput) =>
    apiClient.patch<Category>(`/categories/${id}`, input).then((r) => r.data),
  remove: (id: string) =>
    apiClient
      .delete<{ id: string; deleted: true }>(`/categories/${id}`)
      .then((r) => r.data),
};
