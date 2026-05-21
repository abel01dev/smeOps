import { z } from "zod";

/**
 * Dashboard endpoints are read-only and have no request body. The query
 * schemas below validate the URL parameters; the response types are plain
 * TS interfaces (no input validation needed) so the frontend can type its
 * React Query hooks against them.
 */

export const trendQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
export type TrendQuery = z.infer<typeof trendQuerySchema>;

export const topProductsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  limit: z.coerce.number().int().min(1).max(50).default(5),
});
export type TopProductsQuery = z.infer<typeof topProductsQuerySchema>;

// ---------------------- Response shapes ----------------------

export interface DashboardPeriodMoney {
  revenue: string;
  /** Gross profit from sales (sell − buy, after discounts). */
  profit: string;
  operatingExpenses: string;
  /** Gross profit minus operating expenses. */
  netProfit: string;
}

export interface DashboardSummary {
  today: DashboardPeriodMoney & { salesCount: number };
  week: DashboardPeriodMoney;
  month: DashboardPeriodMoney;
  totals: {
    activeProducts: number;
    customers: number;
    lowStockCount: number;
  };
}

export interface RevenueTrendBucket {
  date: string; // YYYY-MM-DD
  revenue: string;
  profit: string;
  operatingExpenses: string;
  netProfit: string;
  salesCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: string;
  profit: string;
}
