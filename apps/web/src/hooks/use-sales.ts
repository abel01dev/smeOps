"use client";

import { useQuery } from "@tanstack/react-query";

import type { ListSalesParams } from "@/lib/api/sales";
import { salesApi } from "@/lib/api/sales";

const KEY = ["sales"] as const;

export function useSalesList(params: ListSalesParams) {
  return useQuery({
    queryKey: [...KEY, "list", params],
    queryFn: () => salesApi.list(params),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}

export function useSaleDetail(id: string | null) {
  return useQuery({
    queryKey: [...KEY, "detail", id],
    queryFn: () => salesApi.findOne(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
