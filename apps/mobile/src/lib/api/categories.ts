import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export const categoriesApi = {
  list: () => apiClient.get<Category[]>("/categories").then((r) => r.data),
  create: (body: CreateCategoryInput) =>
    apiClient.post<Category>("/categories", body).then((r) => r.data),
  update: (id: string, body: UpdateCategoryInput) =>
    apiClient.patch<Category>(`/categories/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};
