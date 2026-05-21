import type {
  AiInsightsResponse,
  DashboardSummary,
  RevenueTrendBucket,
  TopProduct,
} from "@sme/shared";

import { apiClient } from "../api-client";

export const dashboardApi = {
  summary: () =>
    apiClient.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),
  revenueTrend: (days = 30) =>
    apiClient
      .get<RevenueTrendBucket[]>("/dashboard/revenue-trend", { params: { days } })
      .then((r) => r.data),
  topProducts: (days = 7, limit = 5) =>
    apiClient
      .get<TopProduct[]>("/dashboard/top-products", { params: { days, limit } })
      .then((r) => r.data),
};

export const aiApi = {
  insights: (days = 30) =>
    apiClient
      .get<AiInsightsResponse>("/ai/insights", { params: { days } })
      .then((r) => r.data),
};
