import type {
  CreateEmployeeInput,
  EmployeeSummary,
  UpdateEmployeeRoleInput,
} from "@sme/shared";

import { apiClient } from "../api-client";

export const employeesApi = {
  list: () =>
    apiClient.get<EmployeeSummary[]>("/employees").then((r) => r.data),
  create: (body: CreateEmployeeInput) =>
    apiClient.post<EmployeeSummary>("/employees", body).then((r) => r.data),
  updateRole: (id: string, body: UpdateEmployeeRoleInput) =>
    apiClient
      .patch<EmployeeSummary>(`/employees/${id}/role`, body)
      .then((r) => r.data),
};
