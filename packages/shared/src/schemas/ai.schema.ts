import { z } from "zod";

export const aiInsightsQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
});
export type AiInsightsQuery = z.infer<typeof aiInsightsQuerySchema>;

export const INSIGHT_SEVERITIES = ["info", "success", "warning", "critical"] as const;
export type InsightSeverity = (typeof INSIGHT_SEVERITIES)[number];

export const INSIGHT_CATEGORIES = [
  "revenue",
  "inventory",
  "sales",
  "customers",
  "forecast",
] as const;
export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number];

export interface BusinessInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  message: string;
  /** Optional CTA path in the web app, e.g. /inventory */
  actionHref?: string;
  actionLabel?: string;
}

export interface RevenueForecast {
  /** Next 7 days projected revenue (ETB). */
  next7DaysRevenue: string;
  /** Simple trend label for UI. */
  trend: "up" | "down" | "flat";
  /** Average daily revenue in the analysis window. */
  avgDailyRevenue: string;
}

export interface SalesPrediction {
  /** Expected number of sales in the next 7 days. */
  next7DaysSalesCount: number;
  /** Expected revenue in the next 7 days (matches forecast). */
  next7DaysRevenue: string;
  confidence: "low" | "medium";
  basedOnDays: number;
}

export interface AiInsightsResponse {
  generatedAt: string;
  periodDays: number;
  insights: BusinessInsight[];
  forecast: RevenueForecast;
  prediction: SalesPrediction;
}
