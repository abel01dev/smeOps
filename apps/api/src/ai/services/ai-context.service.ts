import { Injectable } from "@nestjs/common";

import { DashboardService } from "../../dashboard/dashboard.service";
import { AiRawDataService } from "./ai-raw-data.service";

const CONTEXT_DAYS = 30;
const LOW_STOCK_LIMIT = 10;
const RECENT_SALES_LIMIT = 15;

/**
 * Builds business context for the LLM system prompt: summaries plus optional
 * raw tenant JSON (enabled in non-production unless AI_CONTEXT_INCLUDE_RAW=false).
 */
@Injectable()
export class AiContextService {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly rawData: AiRawDataService,
  ) {}

  async buildContextBlock(organizationId: string): Promise<string> {
    const [
      summary,
      trend,
      top,
      byCategory,
      inventoryStatus,
      lowStockProducts,
      recentSales,
      rawBlock,
    ] = await Promise.all([
      this.dashboard.summary(organizationId),
      this.dashboard.revenueTrend(organizationId, 7),
      this.dashboard.topProducts(organizationId, CONTEXT_DAYS, 5),
      this.dashboard.salesByCategory(organizationId, CONTEXT_DAYS),
      this.dashboard.inventoryStatusBreakdown(organizationId),
      this.dashboard.lowStockProducts(organizationId, LOW_STOCK_LIMIT),
      this.dashboard.recentSaleSummaries(organizationId, RECENT_SALES_LIMIT),
      this.rawData.buildRawDataBlock(organizationId),
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

    const categoryLines =
      byCategory.length === 0
        ? "  (no category sales in the last 30 days)"
        : byCategory
            .map(
              (c) =>
                `  ${c.categoryName}: ${c.revenue} revenue, ${c.quantitySold} units sold`,
            )
            .join("\n");

    const lowStockLines =
      lowStockProducts.length === 0
        ? "  (none — all tracked products above minimum)"
        : lowStockProducts
            .map(
              (p) =>
                `  ${p.name}: ${p.stockQuantity} left (min ${p.minStock})`,
            )
            .join("\n");

    const recentSaleLines =
      recentSales.length === 0
        ? "  (no sales recorded yet)"
        : recentSales
            .map((s) => {
              const who = s.customerName ? ` | ${s.customerName}` : "";
              return `  ${s.date} | ${s.total} total | ${s.profit} profit | ${s.itemCount} items | ${s.itemsPreview}${who} | ${s.paymentMethod}`;
            })
            .join("\n");

    const summaryBlock = [
      "## Business snapshot (read-only, summarized)",
      `Today: revenue ${summary.today.revenue}, gross profit ${summary.today.profit}, operating expenses ${summary.today.operatingExpenses}, net profit ${summary.today.netProfit}, ${summary.today.salesCount} sales.`,
      `Last 7 days: revenue ${weekRevenue.toFixed(2)}, ${weekSales} sales.`,
      `Month-to-date: revenue ${summary.month.revenue}, gross profit ${summary.month.profit}, operating expenses ${summary.month.operatingExpenses}, net profit ${summary.month.netProfit}.`,
      `Customers on file: ${summary.totals.customers}.`,
      "",
      "### Top products (30d)",
      topLines,
      "",
      "### Sales by category (30d)",
      categoryLines,
      "",
      "### Inventory status (active products)",
      `In stock: ${inventoryStatus.inStock} | Low stock: ${inventoryStatus.lowStock} | Out of stock: ${inventoryStatus.outOfStock}`,
      "Low-stock products:",
      lowStockLines,
      "",
      `### Recent sales (last ${RECENT_SALES_LIMIT}, newest first)`,
      recentSaleLines,
      "",
      "Gross profit = sales margin; net profit = gross profit minus operating expenses (rent, salaries, transport, etc.).",
      "Use summaries for trends; use raw JSON below for specific sale/customer/product lookups.",
    ].join("\n");

    return rawBlock ? `${summaryBlock}\n${rawBlock}` : summaryBlock;
  }
}
