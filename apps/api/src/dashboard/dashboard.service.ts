import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  DashboardPeriodMoney,
  DashboardSummary,
  InventoryStatusBreakdown,
  LowStockProductSummary,
  RecentSaleSummary,
  RevenueTrendBucket,
  SalesByCategorySlice,
  TopProduct,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPI cards: sales revenue/gross profit + operating expenses + net profit.
   */
  async summary(organizationId: string): Promise<DashboardSummary> {
    const now = new Date();
    const startOfToday = this.startOfDay(now);
    const sevenDaysAgo = this.startOfDay(this.addDays(now, -6));
    const thirtyDaysAgo = this.startOfDay(this.addDays(now, -29));

    const [
      todayAgg,
      weekAgg,
      monthAgg,
      todayExpenses,
      weekExpenses,
      monthExpenses,
      todayCount,
      activeProducts,
      customers,
      lowStockCount,
    ] = await Promise.all([
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
      this.sumExpensesSince(organizationId, startOfToday),
      this.sumExpensesSince(organizationId, sevenDaysAgo),
      this.sumExpensesSince(organizationId, thirtyDaysAgo),
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

    const todayPeriod = this.buildPeriod(
      todayAgg._sum.total,
      todayAgg._sum.profit,
      todayExpenses,
    );
    const weekPeriod = this.buildPeriod(
      weekAgg._sum.total,
      weekAgg._sum.profit,
      weekExpenses,
    );
    const monthPeriod = this.buildPeriod(
      monthAgg._sum.total,
      monthAgg._sum.profit,
      monthExpenses,
    );

    return {
      today: { ...todayPeriod, salesCount: todayCount },
      week: weekPeriod,
      month: monthPeriod,
      totals: { activeProducts, customers, lowStockCount },
    };
  }

  async revenueTrend(
    organizationId: string,
    days: number,
  ): Promise<RevenueTrendBucket[]> {
    const now = new Date();
    const since = this.startOfDay(this.addDays(now, -(days - 1)));

    const [sales, expenses] = await Promise.all([
      this.prisma.sale.findMany({
        where: { organizationId, createdAt: { gte: since } },
        select: { createdAt: true, total: true, profit: true },
      }),
      this.prisma.operationalExpense.findMany({
        where: { organizationId, expenseDate: { gte: since } },
        select: { expenseDate: true, amount: true },
      }),
    ]);

    const buckets = new Map<
      string,
      { revenue: number; profit: number; expenses: number; salesCount: number }
    >();
    for (let d = 0; d < days; d++) {
      const date = this.addDays(since, d);
      buckets.set(this.dayKey(date), {
        revenue: 0,
        profit: 0,
        expenses: 0,
        salesCount: 0,
      });
    }

    for (const s of sales) {
      const key = this.dayKey(s.createdAt);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.revenue += Number(s.total);
      bucket.profit += Number(s.profit);
      bucket.salesCount += 1;
    }

    for (const e of expenses) {
      const key = this.dayKey(e.expenseDate);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.expenses += Number(e.amount);
    }

    return Array.from(buckets.entries()).map(([date, b]) => ({
      date,
      revenue: b.revenue.toFixed(2),
      profit: b.profit.toFixed(2),
      operatingExpenses: b.expenses.toFixed(2),
      netProfit: (b.profit - b.expenses).toFixed(2),
      salesCount: b.salesCount,
    }));
  }

  async salesByCategory(
    organizationId: string,
    days: number,
  ): Promise<SalesByCategorySlice[]> {
    const since = this.startOfDay(this.addDays(new Date(), -(days - 1)));

    const items = await this.prisma.saleItem.findMany({
      where: { sale: { organizationId, createdAt: { gte: since } } },
      select: {
        quantity: true,
        lineTotal: true,
        product: {
          select: { category: { select: { id: true, name: true } } },
        },
      },
    });

    const byCategory = new Map<
      string,
      { categoryId: string | null; categoryName: string; revenue: number; quantitySold: number }
    >();

    for (const item of items) {
      const categoryId = item.product.category?.id ?? null;
      const categoryName = item.product.category?.name ?? "Uncategorized";
      const key = categoryId ?? "__uncategorized__";
      const bucket = byCategory.get(key) ?? {
        categoryId,
        categoryName,
        revenue: 0,
        quantitySold: 0,
      };
      bucket.revenue += Number(item.lineTotal);
      bucket.quantitySold += item.quantity;
      byCategory.set(key, bucket);
    }

    return Array.from(byCategory.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((c) => ({
        categoryId: c.categoryId,
        categoryName: c.categoryName,
        revenue: c.revenue.toFixed(2),
        quantitySold: c.quantitySold,
      }));
  }

  async inventoryStatusBreakdown(
    organizationId: string,
  ): Promise<InventoryStatusBreakdown> {
    const products = await this.prisma.product.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: { stockQuantity: true, minStock: true },
    });

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const p of products) {
      if (p.stockQuantity <= 0) {
        outOfStock += 1;
      } else if (p.minStock > 0 && p.stockQuantity <= p.minStock) {
        lowStock += 1;
      } else {
        inStock += 1;
      }
    }

    return { inStock, lowStock, outOfStock };
  }

  async lowStockProducts(
    organizationId: string,
    limit = 10,
  ): Promise<LowStockProductSummary[]> {
    const rows = await this.prisma.product.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        minStock: { gt: 0 },
        stockQuantity: { lte: this.prisma.product.fields.minStock },
      },
      orderBy: { stockQuantity: "asc" },
      take: limit,
      select: { name: true, stockQuantity: true, minStock: true },
    });
    return rows.map((p) => ({
      name: p.name,
      stockQuantity: p.stockQuantity,
      minStock: p.minStock,
    }));
  }

  async recentSaleSummaries(
    organizationId: string,
    limit = 15,
  ): Promise<RecentSaleSummary[]> {
    const sales = await this.prisma.sale.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        total: true,
        profit: true,
        paymentMethod: true,
        customer: { select: { name: true } },
        items: {
          select: { productName: true, quantity: true },
          orderBy: { lineTotal: "desc" },
          take: 4,
        },
        _count: { select: { items: true } },
      },
    });

    return sales.map((s) => {
      const previewParts = s.items.map(
        (i) => `${i.productName} x${i.quantity}`,
      );
      const extra = s._count.items - s.items.length;
      const itemsPreview =
        extra > 0
          ? `${previewParts.join(", ")} (+${extra} more)`
          : previewParts.join(", ") || "(no items)";

      return {
        id: s.id,
        date: this.dayKey(s.createdAt),
        total: s.total.toString(),
        profit: s.profit.toString(),
        paymentMethod: s.paymentMethod,
        customerName: s.customer?.name ?? null,
        itemCount: s._count.items,
        itemsPreview,
      };
    });
  }

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

  private async sumExpensesSince(
    organizationId: string,
    since: Date,
  ): Promise<number> {
    const agg = await this.prisma.operationalExpense.aggregate({
      where: { organizationId, expenseDate: { gte: since } },
      _sum: { amount: true },
    });
    return Number(agg._sum.amount ?? 0);
  }

  private buildPeriod(
    revenue: Prisma.Decimal | null | undefined,
    profit: Prisma.Decimal | null | undefined,
    operatingExpenses: number,
  ): DashboardPeriodMoney {
    const gross = Number(profit ?? 0);
    const expenses = operatingExpenses;
    return {
      revenue: this.sumOrZero(revenue),
      profit: gross.toFixed(2),
      operatingExpenses: expenses.toFixed(2),
      netProfit: (gross - expenses).toFixed(2),
    };
  }

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
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  private sumOrZero(d: Prisma.Decimal | null | undefined): string {
    return d ? d.toString() : "0.00";
  }
}
