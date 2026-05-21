import type {
  CreateSaleInput,
  PaginatedResult,
  PaymentMethod,
  Sale,
} from "@sme/shared";

import { apiClient } from "../api-client";

export interface ListSalesParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  paymentMethod?: PaymentMethod;
}

export const salesApi = {
  list: (params: ListSalesParams = {}) =>
    apiClient
      .get<PaginatedResult<Sale>>("/sales", { params })
      .then((r) => r.data),
  get: (id: string) => apiClient.get<Sale>(`/sales/${id}`).then((r) => r.data),
  create: (body: CreateSaleInput) =>
    apiClient.post<Sale>("/sales", body).then((r) => r.data),
};
