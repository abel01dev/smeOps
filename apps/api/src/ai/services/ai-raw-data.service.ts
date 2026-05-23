import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../../prisma/prisma.service";

/** Per-entity caps — fine for test tenants; set AI_CONTEXT_INCLUDE_RAW=false in prod if needed. */
const LIMITS = {
  sales: 500,
  products: 500,
  customers: 500,
  expenses: 500,
  categories: 100,
} as const;

@Injectable()
export class AiRawDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  isEnabled(): boolean {
    const explicit = this.config.get<string>("AI_CONTEXT_INCLUDE_RAW");
    if (explicit === "false") return false;
    if (explicit === "true") return true;
    return this.config.get<string>("NODE_ENV", "development") !== "production";
  }

  async buildRawDataBlock(organizationId: string): Promise<string> {
    if (!this.isEnabled()) return "";

    const [sales, products, customers, expenses, categories] = await Promise.all([
      this.prisma.sale.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: LIMITS.sales,
        select: {
          id: true,
          createdAt: true,
          subtotal: true,
          discount: true,
          total: true,
          profit: true,
          paymentMethod: true,
          paymentStatus: true,
          amountPaid: true,
          amountDue: true,
          dueDate: true,
          note: true,
          customer: { select: { id: true, name: true, phone: true } },
          cashier: { select: { name: true } },
          items: {
            select: {
              productId: true,
              productName: true,
              quantity: true,
              buyPriceAtSale: true,
              sellPriceAtSale: true,
              lineTotal: true,
              lineProfit: true,
            },
          },
        },
      }),
      this.prisma.product.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
        take: LIMITS.products,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          buyPrice: true,
          sellPrice: true,
          stockQuantity: true,
          minStock: true,
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.customer.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
        take: LIMITS.customers,
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          totalSpent: true,
          outstandingBalance: true,
          creditLimit: true,
          createdAt: true,
        },
      }),
      this.prisma.operationalExpense.findMany({
        where: { organizationId },
        orderBy: { expenseDate: "desc" },
        take: LIMITS.expenses,
        select: {
          id: true,
          expenseDate: true,
          amount: true,
          paymentMethod: true,
          description: true,
          category: { select: { id: true, name: true } },
          recordedBy: { select: { name: true } },
        },
      }),
      this.prisma.category.findMany({
        where: { organizationId },
        orderBy: { name: "asc" },
        take: LIMITS.categories,
        select: { id: true, name: true },
      }),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      limits: LIMITS,
      sales: sales.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        subtotal: s.subtotal.toString(),
        discount: s.discount.toString(),
        total: s.total.toString(),
        profit: s.profit.toString(),
        amountPaid: s.amountPaid.toString(),
        amountDue: s.amountDue.toString(),
        dueDate: s.dueDate?.toISOString().slice(0, 10) ?? null,
        items: s.items.map((i) => ({
          ...i,
          buyPriceAtSale: i.buyPriceAtSale.toString(),
          sellPriceAtSale: i.sellPriceAtSale.toString(),
          lineTotal: i.lineTotal.toString(),
          lineProfit: i.lineProfit.toString(),
        })),
      })),
      products: products.map((p) => ({
        ...p,
        buyPrice: p.buyPrice.toString(),
        sellPrice: p.sellPrice.toString(),
      })),
      customers: customers.map((c) => ({
        ...c,
        totalSpent: c.totalSpent.toString(),
        outstandingBalance: c.outstandingBalance.toString(),
        creditLimit: c.creditLimit?.toString() ?? null,
        createdAt: c.createdAt.toISOString(),
      })),
      expenses: expenses.map((e) => ({
        ...e,
        expenseDate: e.expenseDate.toISOString().slice(0, 10),
        amount: e.amount.toString(),
      })),
      categories,
    };

    return [
      "",
      "## Raw tenant data (JSON export for detailed questions)",
      "Use this data for specific lookups. Do not invent records not listed here.",
      "Sales include paymentStatus (PAID|PARTIAL|UNPAID), amountPaid, amountDue, dueDate.",
      "Customers include outstandingBalance (total owed) and optional creditLimit.",
      "```json",
      JSON.stringify(payload),
      "```",
    ].join("\n");
  }
}
