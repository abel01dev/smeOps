import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  DashboardSummary,
  RevenueTrendBucket,
  TopProduct,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI cards data: revenue/profit windows + product/customer counts + low-stock count.
   * Runs all aggregates concurrently — one slow query doesn't block the others.
   */
  async summary(organizationId: string): Promise<DashboardSummary> {
    const now = new Date();
    const startOfToday = this.startOfDay(now);
    const sevenDaysAgo = this.startOfDay(this.addDays(now, -6));   // includes today
    const thirtyDaysAgo = this.startOfDay(this.addDays(now, -29)); // includes today

    const [todayAgg, weekAgg, monthAgg, todayCount, activeProducts, customers, lowStockCount] =
      await Promise.all([
        this.prisma.sale.aggregate({
          where: { organizationId, createdAt: { gte: startOfToday } },
          _sum: { total: true, profit: true },
        }),
        this.prisma.sale.aggregate({
          where: { organizationId, createdAt: { gte: sevenDaysAgo } },
          _sum: { total: true, profit: true },
        }),
        this.prisma.sale.aggregate({
          where: { organizationId, createdAt: { gte: thirtyDaysAgo } },
          _sum: { total: true, profit: true },
        }),
        this.prisma.sale.count({
          where: { organizationId, createdAt: { gte: startOfToday } },
        }),
        this.prisma.product.count({
          where: { organizationId, status: "ACTIVE" },
        }),
        this.prisma.customer.count({ where: { organizationId } }),
        this.prisma.product.count({
          where: {
            organizationId,
            status: "ACTIVE",
            minStock: { gt: 0 },
            stockQuantity: { lte: this.prisma.product.fields.minStock },
          },
        }),
      ]);

    return {
      today: {
        revenue: this.sumOrZero(todayAgg._sum.total),
        profit: this.sumOrZero(todayAgg._sum.profit),
        salesCount: todayCount,
      },
      week: {
        revenue: this.sumOrZero(weekAgg._sum.total),
        profit: this.sumOrZero(weekAgg._sum.profit),
      },
      month: {
        revenue: this.sumOrZero(monthAgg._sum.total),
        profit: this.sumOrZero(monthAgg._sum.profit),
      },
      totals: { activeProducts, customers, lowStockCount },
    };
  }

  /**
   * Daily revenue + profit + sales count for the last N days, ending today.
   * Returns one bucket per day even if there are zero sales — empty days show
   * as flat 0s on the chart, which is the correct UX for a sparse business.
   */
  async revenueTrend(
    organizationId: string,
    days: number,
  ): Promise<RevenueTrendBucket[]> {
    const now = new Date();
    const since = this.startOfDay(this.addDays(now, -(days - 1)));

    const sales = await this.prisma.sale.findMany({
      where: { organizationId, createdAt: { gte: since } },
      select: { createdAt: true, total: true, profit: true },
    });

    const buckets = new Map<string, { revenue: number; profit: number; salesCount: number }>();
    for (let d = 0; d < days; d++) {
      const date = this.addDays(since, d);
      buckets.set(this.dayKey(date), { revenue: 0, profit: 0, salesCount: 0 });
    }

    for (const s of sales) {
      const key = this.dayKey(s.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) continue; // out of range (defensive)
      bucket.revenue += Number(s.total);
      bucket.profit += Number(s.profit);
      bucket.salesCount += 1;
    }

    return Array.from(buckets.entries()).map(([date, b]) => ({
      date,
      revenue: b.revenue.toFixed(2),
      profit: b.profit.toFixed(2),
      salesCount: b.salesCount,
    }));
  }

  /**
   * Top N products by revenue in the last `days`. Uses Prisma groupBy on
   * SaleItem so we don't pull rows into Node just to sum them.
   */
  async topProducts(
    organizationId: string,
    days: number,
    limit: number,
  ): Promise<TopProduct[]> {
    const since = this.startOfDay(this.addDays(new Date(), -(days - 1)));

    const grouped = await this.prisma.saleItem.groupBy({
      by: ["productId", "productName"],
      where: {
        sale: { organizationId, createdAt: { gte: since } },
      },
      _sum: { lineTotal: true, lineProfit: true, quantity: true },
      orderBy: { _sum: { lineTotal: "desc" } },
      take: limit,
    });

    return grouped.map((g) => ({
      productId: g.productId,
      productName: g.productName,
      quantitySold: g._sum.quantity ?? 0,
      revenue: this.sumOrZero(g._sum.lineTotal),
      profit: this.sumOrZero(g._sum.lineProfit),
    }));
  }

  // -------------------- helpers --------------------

  private startOfDay(d: Date): Date {
    const out = new Date(d);
    out.setHours(0, 0, 0, 0);
    return out;
  }

  private addDays(d: Date, n: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
  }

  private dayKey(d: Date): string {
    // YYYY-MM-DD in the server's local timezone — fine for a single-shop MVP.
    // For multi-region tenants we'd switch to UTC or store an Organization.tz.
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  private sumOrZero(d: Prisma.Decimal | null | undefined): string {
    return d ? d.toString() : "0.00";
  }
}
