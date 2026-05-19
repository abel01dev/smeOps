"use client";

import { useQuery } from "@tanstack/react-query";

import { aiApi } from "@/lib/api/ai";

export function useAiInsights(days: number) {
  return useQuery({
    queryKey: ["ai", "insights", days],
    queryFn: () => aiApi.insights(days),
    staleTime: 120_000,
  });
}
