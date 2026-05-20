"use client";

import type { CreateEmployeeInput, UpdateEmployeeRoleInput } from "@sme/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    mutationFn: (input: CreateEmployeeInput) => employeesApi.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeRoleInput }) =>
      employeesApi.updateRole(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}
