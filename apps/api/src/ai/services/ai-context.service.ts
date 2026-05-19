import { Injectable } from "@nestjs/common";

import { DashboardService } from "../../dashboard/dashboard.service";

/**
 * Builds a compact, structured business snapshot for the LLM system prompt.
 * Never sends raw DB rows — only summarized KPIs and top lists.
 */
@Injectable()
export class AiContextService {
  constructor(private readonly dashboard: DashboardService) {}

  async buildContextBlock(organizationId: string): Promise<string> {
    const [summary, trend, top] = await Promise.all([
      this.dashboard.summary(organizationId),
      this.dashboard.revenueTrend(organizationId, 7),
      this.dashboard.topProducts(organizationId, 30, 5),
    ]);

    const weekRevenue = trend.reduce((s, d) => s + Number(d.revenue), 0);
    const weekSales = trend.reduce((s, d) => s + d.salesCount, 0);
    const topLines =
      top.length === 0
        ? "  (no sales in the last 30 days)"
        : top
            .map(
              (p, i) =>
                `  ${i + 1}. ${p.productName}: ${p.revenue} revenue, ${p.quantitySold} units`,
            )
            .join("\n");

    return [
      "## Business snapshot (read-only, summarized)",
      `Today: revenue ${summary.today.revenue}, profit ${summary.today.profit}, ${summary.today.salesCount} sales.`,
      `Last 7 days: revenue ${weekRevenue.toFixed(2)}, ${weekSales} sales.`,
      `Month-to-date: revenue ${summary.month.revenue}, profit ${summary.month.profit}.`,
      `Inventory: ${summary.totals.activeProducts} active products, ${summary.totals.lowStockCount} low-stock alerts.`,
      `Customers on file: ${summary.totals.customers}.`,
      "Top products (30d):",
      topLines,
      "",
      "Use this context when answering business questions. If data is missing, say so and suggest recording sales in POS.",
    ].join("\n");
  }
}
