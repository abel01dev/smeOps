"use client";

import type {
  CreateCustomerInput,
  Customer,
  PaginatedResult,
  UpdateCustomerInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export interface CustomerDetail extends Customer {
  recentSales: Array<{
    id: string;
    total: string;
    paymentMethod: string;
    createdAt: string;
    items: Array<{ productName: string; quantity: number; lineTotal: string }>;
  }>;
}

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export const customersApi = {
  list: (params: ListCustomersParams = {}) =>
    apiClient
      .get<PaginatedResult<Customer>>("/customers", { params })
      .then((r) => r.data),
  findOne: (id: string) =>
    apiClient.get<CustomerDetail>(`/customers/${id}`).then((r) => r.data),
  create: (input: CreateCustomerInput) =>
    apiClient.post<Customer>("/customers", input).then((r) => r.data),
  update: (id: string, input: UpdateCustomerInput) =>
    apiClient.patch<Customer>(`/customers/${id}`, input).then((r) => r.data),
  remove: (id: string) =>
    apiClient
      .delete<{ id: string; deleted: true }>(`/customers/${id}`)
      .then((r) => r.data),
};
