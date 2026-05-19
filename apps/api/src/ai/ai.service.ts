import { Injectable } from "@nestjs/common";
import type { AiInsightsResponse, BusinessInsight } from "@sme/shared";

import { DashboardService } from "../dashboard/dashboard.service";

/**
 * Rule-based "AI" insights — deterministic, fast, no external API.
 * Swap this service implementation later for an LLM provider using the same
 * response shape from @sme/shared.
 */
@Injectable()
export class AiService {
  constructor(private readonly dashboard: DashboardService) {}

  async insights(organizationId: string, days: number): Promise<AiInsightsResponse> {
    const summary = await this.dashboard.summary(organizationId);
    const trend = await this.dashboard.revenueTrend(organizationId, days);
    const top = await this.dashboard.topProducts(organizationId, days, 5);

    const insights: BusinessInsight[] = [];
    let id = 0;
    const add = (
      partial: Omit<BusinessInsight, "id">,
    ) => {
      insights.push({ id: `insight-${++id}`, ...partial });
    };

    const totalRevenue = trend.reduce((s, b) => s + Number(b.revenue), 0);
    const totalSales = trend.reduce((s, b) => s + b.salesCount, 0);
    const avgDailyRevenue = days > 0 ? totalRevenue / days : 0;
    const avgDailySales = days > 0 ? totalSales / days : 0;

    const half = Math.floor(days / 2);
    const recent = trend.slice(-half);
    const prior = trend.slice(0, half);
    const recentRev = recent.reduce((s, b) => s + Number(b.revenue), 0);
    const priorRev = prior.reduce((s, b) => s + Number(b.revenue), 0);
    const revChange =
      priorRev > 0 ? ((recentRev - priorRev) / priorRev) * 100 : recentRev > 0 ? 100 : 0;

    let trendDir: "up" | "down" | "flat" = "flat";
    if (revChange > 8) trendDir = "up";
    else if (revChange < -8) trendDir = "down";

    // --- Revenue insights ---
    if (Number(summary.today.revenue) === 0 && totalSales > 0) {
      add({
        category: "sales",
        severity: "info",
        title: "No sales recorded today yet",
        message:
          "You have recent activity in the last few weeks. Open POS when customers arrive to keep today's numbers accurate.",
        actionHref: "/pos",
        actionLabel: "Open POS",
      });
    }

    if (trendDir === "up") {
      add({
        category: "revenue",
        severity: "success",
        title: "Revenue is trending up",
        message: `Revenue in the most recent half of the last ${days} days is about ${Math.round(revChange)}% higher than the earlier half. Keep stock on your top sellers.`,
        actionHref: "/dashboard",
        actionLabel: "View dashboard",
      });
    } else if (trendDir === "down" && priorRev > 0) {
      add({
        category: "revenue",
        severity: "warning",
        title: "Revenue has slowed recently",
        message: `Sales revenue dipped roughly ${Math.abs(Math.round(revChange))}% compared to the earlier part of this period. Review pricing, promotions, or low-stock items.`,
        actionHref: "/sales",
        actionLabel: "Review sales",
      });
    }

    const todayProfit = Number(summary.today.profit);
    const todayRevenue = Number(summary.today.revenue);
    if (todayRevenue > 0) {
      const margin = (todayProfit / todayRevenue) * 100;
      if (margin < 10) {
        add({
          category: "revenue",
          severity: "warning",
          title: "Thin profit margin today",
          message: `Today's margin is about ${margin.toFixed(0)}%. Check buy vs sell prices on items you sold today.`,
          actionHref: "/inventory",
          actionLabel: "Check inventory",
        });
      } else if (margin >= 25) {
        add({
          category: "revenue",
          severity: "success",
          title: "Healthy margin today",
          message: `You're keeping about ${margin.toFixed(0)}% of today's sales as profit. Strong pricing discipline.`,
        });
      }
    }

    // --- Inventory ---
    if (summary.totals.lowStockCount > 0) {
      add({
        category: "inventory",
        severity: summary.totals.lowStockCount >= 3 ? "critical" : "warning",
        title: `${summary.totals.lowStockCount} product${summary.totals.lowStockCount === 1 ? "" : "s"} low on stock`,
        message:
          "Restock before you lose sales at checkout. Low-stock items won't sell if quantity hits zero.",
        actionHref: "/inventory",
        actionLabel: "Manage inventory",
      });
    }

    // --- Top products ---
    if (top.length > 0) {
      const leader = top[0]!;
      add({
        category: "sales",
        severity: "info",
        title: `"${leader.productName}" leads sales`,
        message: `It brought in ${leader.revenue} ETB over the last ${days} days (${leader.quantitySold} units). Make sure it stays in stock.`,
        actionHref: "/inventory",
        actionLabel: "View inventory",
      });
    }

    // --- Customers ---
    if (summary.totals.customers === 0) {
      add({
        category: "customers",
        severity: "info",
        title: "No customers on file yet",
        message:
          "Adding regular buyers helps you track who spends the most and speeds up POS checkout.",
        actionHref: "/customers",
        actionLabel: "Add customers",
      });
    } else if (summary.totals.customers < 5 && totalSales > 10) {
      add({
        category: "customers",
        severity: "info",
        title: "Capture more customer profiles",
        message:
          "You have steady sales but few saved customers. Attach buyers at POS to build loyalty data.",
        actionHref: "/pos",
        actionLabel: "Sell with customer",
      });
    }

    // --- Forecast insight ---
    const next7Revenue = avgDailyRevenue * 7;
    const next7Sales = Math.round(avgDailySales * 7);
    add({
      category: "forecast",
      severity: "info",
      title: "7-day outlook",
      message:
        trendDir === "up"
          ? `If recent momentum continues, expect roughly ${next7Revenue.toFixed(2)} ETB and about ${next7Sales} sales next week.`
          : trendDir === "down"
            ? `Based on the recent dip, plan for around ${next7Revenue.toFixed(2)} ETB and ~${next7Sales} sales next week unless you promote or restock.`
            : `Steady pace suggests about ${next7Revenue.toFixed(2)} ETB and ~${next7Sales} sales over the next 7 days.`,
    });

    if (insights.length === 0) {
      add({
        category: "sales",
        severity: "info",
        title: "Keep recording sales",
        message:
          "Once you log more transactions in POS, insights will highlight trends, stock risks, and forecasts.",
        actionHref: "/pos",
        actionLabel: "Record a sale",
      });
    }

    const confidence: "low" | "medium" =
      totalSales >= days * 0.5 ? "medium" : "low";

    return {
      generatedAt: new Date().toISOString(),
      periodDays: days,
      insights: insights.slice(0, 8),
      forecast: {
        next7DaysRevenue: next7Revenue.toFixed(2),
        trend: trendDir,
        avgDailyRevenue: avgDailyRevenue.toFixed(2),
      },
      prediction: {
        next7DaysSalesCount: next7Sales,
        next7DaysRevenue: next7Revenue.toFixed(2),
        confidence,
        basedOnDays: days,
      },
    };
  }
}
