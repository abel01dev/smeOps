"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "@sme/shared";

import type { ListCustomersParams } from "@/lib/api/customers";
import { customersApi } from "@/lib/api/customers";

const KEY = ["customers"] as const;

export function useCustomersList(params: ListCustomersParams) {
  return useQuery({
    queryKey: [...KEY, "list", params],
    queryFn: () => customersApi.list(params),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: [...KEY, "detail", id],
    queryFn: () => customersApi.findOne(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersApi.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      customersApi.update(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
}
