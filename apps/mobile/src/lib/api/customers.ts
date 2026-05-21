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
    createdAt: string;
  }>;
}

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const customersApi = {
  list: (params?: ListCustomersParams) =>
    apiClient
      .get<PaginatedResult<Customer>>("/customers", { params })
      .then((r) => r.data),
  get: (id: string) =>
    apiClient.get<CustomerDetail>(`/customers/${id}`).then((r) => r.data),
  create: (body: CreateCustomerInput) =>
    apiClient.post<Customer>("/customers", body).then((r) => r.data),
  update: (id: string, body: UpdateCustomerInput) =>
    apiClient.patch<Customer>(`/customers/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
};
