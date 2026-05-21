import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateEmployeeInput, UpdateEmployeeRoleInput } from "@sme/shared";

import { employeesApi } from "@/lib/api/employees";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => employeesApi.list(),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEmployeeInput) => employeesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEmployeeRoleInput }) =>
      employeesApi.updateRole(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}
