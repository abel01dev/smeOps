import { useQuery } from "@tanstack/react-query";

import { aiApi, dashboardApi } from "@/lib/api/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => dashboardApi.summary(),
  });
}

export function useRevenueTrend(days = 30) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", days],
    queryFn: () => dashboardApi.revenueTrend(days),
  });
}

export function useTopProducts(days = 7, limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "top-products", days, limit],
    queryFn: () => dashboardApi.topProducts(days, limit),
  });
}

export function useAiInsights(days = 30) {
  return useQuery({
    queryKey: ["ai", "insights", days],
    queryFn: () => aiApi.insights(days),
  });
}
