import { useQuery } from "@tanstack/react-query";

import { salesApi, type ListSalesParams } from "@/lib/api/sales";

export function useSalesList(params: ListSalesParams = { page: 1, pageSize: 20 }) {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () => salesApi.list(params),
  });
}

export function useSaleDetail(id: string | null) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => salesApi.get(id!),
    enabled: !!id,
  });
}
