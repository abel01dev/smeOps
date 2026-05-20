"use client";

import type {
  CreateEmployeeInput,
  EmployeeSummary,
  UpdateEmployeeRoleInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export const employeesApi = {
  list: () => apiClient.get<EmployeeSummary[]>("/employees").then((r) => r.data),
  create: (input: CreateEmployeeInput) =>
    apiClient.post<EmployeeSummary>("/employees", input).then((r) => r.data),
  updateRole: (id: string, input: UpdateEmployeeRoleInput) =>
    apiClient
      .patch<EmployeeSummary>(`/employees/${id}/role`, input)
      .then((r) => r.data),
};
