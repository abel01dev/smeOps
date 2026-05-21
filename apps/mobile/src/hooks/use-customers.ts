import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateCustomerInput, UpdateCustomerInput } from "@sme/shared";

import { customersApi } from "@/lib/api/customers";

export function useCustomersList(search = "", page = 1) {
  return useQuery({
    queryKey: ["customers", search, page],
    queryFn: () =>
      customersApi.list({ search: search || undefined, page, pageSize: 20 }),
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customersApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomerInput) => customersApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCustomerInput }) =>
      customersApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
