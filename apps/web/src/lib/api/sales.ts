"use client";

import type {
  CreateSaleInput,
  PaginatedResult,
  PaymentMethod,
  RecordSalePaymentInput,
  Sale,
  SalePaymentStatus,
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
  paymentStatus?: SalePaymentStatus;
  hasBalance?: boolean;
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
  recordPayment: (saleId: string, input: RecordSalePaymentInput) =>
    apiClient
      .post<Sale>(`/sales/${saleId}/payments`, input)
      .then((r) => r.data),
};
