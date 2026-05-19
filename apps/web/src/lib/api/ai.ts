"use client";

import type { AiInsightsResponse } from "@sme/shared";

import { apiClient } from "../api-client";

export const aiApi = {
  insights: (days = 30) =>
    apiClient
      .get<AiInsightsResponse>("/ai/insights", { params: { days } })
      .then((r) => r.data),
};
