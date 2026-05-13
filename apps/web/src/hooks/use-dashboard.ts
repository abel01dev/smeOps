"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/lib/api/dashboard";

/**
 * Three independent queries — change one filter (e.g. period) and only the
 * affected queries refetch. KPI cards never blink when the chart window changes.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardApi.summary(),
    staleTime: 60_000,
  });
}

export function useRevenueTrend(days: number) {
  return useQuery({
    queryKey: ["dashboard", "trend", days],
    queryFn: () => dashboardApi.trend(days),
    staleTime: 60_000,
  });
}

export function useTopProducts(days: number, limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "top-products", days, limit],
    queryFn: () => dashboardApi.topProducts(days, limit),
    staleTime: 60_000,
  });
}

export function useLowStockProducts(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "low-stock", limit],
    queryFn: async () => {
      const { productsApi } = await import("@/lib/api/products");
      return productsApi.list({
        lowStockOnly: true,
        status: "ACTIVE",
        pageSize: limit,
        sortBy: "stockQuantity",
        sortDir: "asc",
      });
    },
    staleTime: 60_000,
  });
}
