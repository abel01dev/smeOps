"use client";

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
  findOne: (id: string) =>
    apiClient.get<Sale>(`/sales/${id}`).then((r) => r.data),
  create: (input: CreateSaleInput) =>
    apiClient.post<Sale>("/sales", input).then((r) => r.data),
};
