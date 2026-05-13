import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CreateSaleInput,
  PaginatedResult,
  PaymentMethod,
  Sale,
  SaleItem,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

interface ListArgs {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  paymentMethod?: PaymentMethod;
}

const SORTABLE_COLUMNS = new Set(["createdAt", "total", "profit"]);

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The crown jewel of the API.
   *
   * Records a sale in one atomic operation:
   *   1. Verify customer (if given) belongs to this org.
   *   2. Bulk-load all products in the cart, scoped to this org + ACTIVE.
   *      (Cross-tenant or archived productIds are rejected as "not found".)
   *   3. For each item: build a frozen snapshot (productName + buyPrice +
   *      sellPrice at this moment) and compute lineTotal + lineProfit.
   *   4. Atomically decrement stock per item using updateMany with a
   *      `stockQuantity >= qty` predicate. If count = 0, the row didn't match
   *      → either it was concurrently sold or stock changed → roll back.
   *   5. Create the Sale + SaleItems row.
   *   6. If a customer is attached, increment their totalSpent.
   *   7. The whole thing runs inside prisma.$transaction so a failure at any
   *      step rolls back the stock decrements, the sale, everything.
   */
  async create(
    organizationId: string,
    cashierId: string,
    input: CreateSaleInput,
  ): Promise<Sale> {
    if (this.hasDuplicateProductIds(input.items)) {
      throw new BadRequestException(
        "Duplicate productId in items. Consolidate quantities before submitting.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (input.customerId) {
        const c = await tx.customer.findFirst({
          where: { id: input.customerId, organizationId },
          select: { id: true },
        });
        if (!c) throw new BadRequestException("Customer not found");
      }

      const productIds = input.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, organizationId, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          buyPrice: true,
          sellPrice: true,
          stockQuantity: true,
        },
      });

      if (products.length !== productIds.length) {
        const found = new Set(products.map((p) => p.id));
        const missing = productIds.filter((id) => !found.has(id));
        throw new BadRequestException(
          `One or more products are unavailable or archived: ${missing.join(", ")}`,
        );
      }

      const byId = new Map(products.map((p) => [p.id, p]));

      // Build line items + running totals before any DB write — fail fast on bad math.
      let subtotalCents = 0;
      let profitCents = 0;
      const itemRows: Prisma.SaleItemCreateWithoutSaleInput[] = [];

      for (const i of input.items) {
        const p = byId.get(i.productId)!;
        if (p.stockQuantity < i.quantity) {
          throw new ConflictException(
            `Insufficient stock for "${p.name}" — have ${p.stockQuantity}, need ${i.quantity}`,
          );
        }
        const sellCents = this.toCents(p.sellPrice);
        const buyCents = this.toCents(p.buyPrice);
        const lineTotalCents = sellCents * i.quantity;
        const lineProfitCents = (sellCents - buyCents) * i.quantity;

        subtotalCents += lineTotalCents;
        profitCents += lineProfitCents;

        itemRows.push({
          product: { connect: { id: p.id } },
          productName: p.name,
          quantity: i.quantity,
          buyPriceAtSale: p.buyPrice,
          sellPriceAtSale: p.sellPrice,
          lineTotal: this.fromCents(lineTotalCents),
          lineProfit: this.fromCents(lineProfitCents),
        });
      }

      const discountCents = Math.round(input.discount * 100);
      if (discountCents > subtotalCents) {
        throw new BadRequestException(
          "Discount cannot be greater than the subtotal",
        );
      }
      const totalCents = subtotalCents - discountCents;
      // Discount eats into profit (the shop ate the discount, not the supplier).
      const finalProfitCents = profitCents - discountCents;

      // 4) Atomic stock decrement per item.
      for (const i of input.items) {
        const result = await tx.product.updateMany({
          where: {
            id: i.productId,
            organizationId,
            status: "ACTIVE",
            stockQuantity: { gte: i.quantity },
          },
          data: { stockQuantity: { decrement: i.quantity } },
        });
        if (result.count === 0) {
          // Stock was decremented by another concurrent sale between our read and write.
          throw new ConflictException(
            "Stock changed while processing this sale. Please refresh and try again.",
          );
        }
      }

      // 5) Create the Sale + nested items.
      const created = await tx.sale.create({
        data: {
          organizationId,
          customerId: input.customerId ?? null,
          cashierId,
          subtotal: this.fromCents(subtotalCents),
          discount: this.fromCents(discountCents),
          total: this.fromCents(totalCents),
          profit: this.fromCents(finalProfitCents),
          paymentMethod: input.paymentMethod,
          note: input.note ?? null,
          items: { create: itemRows },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          cashier: { select: { id: true, name: true } },
        },
      });

      // 6) Update denormalized customer.totalSpent.
      if (input.customerId) {
        await tx.customer.update({
          where: { id: input.customerId },
          data: { totalSpent: { increment: this.fromCents(totalCents) } },
        });
      }

      return this.toDto(created);
    });
  }

  async list(
    organizationId: string,
    args: ListArgs,
  ): Promise<PaginatedResult<Sale>> {
    const { page, pageSize, sortDir, dateFrom, dateTo, customerId, paymentMethod } =
      args;
    const sortBy =
      args.sortBy && SORTABLE_COLUMNS.has(args.sortBy) ? args.sortBy : "createdAt";

    const where: Prisma.SaleWhereInput = {
      organizationId,
      ...(customerId ? { customerId } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          cashier: { select: { id: true, name: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      items: items.map(this.toDto),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(organizationId: string, id: string): Promise<Sale> {
    const sale = await this.prisma.sale.findFirst({
      where: { id, organizationId },
      include: {
        items: true,
        customer: { select: { id: true, name: true } },
        cashier: { select: { id: true, name: true } },
      },
    });
    if (!sale) throw new NotFoundException("Sale not found");
    return this.toDto(sale);
  }

  // -------------------- private helpers --------------------

  private hasDuplicateProductIds(items: Array<{ productId: string }>): boolean {
    const seen = new Set<string>();
    for (const i of items) {
      if (seen.has(i.productId)) return true;
      seen.add(i.productId);
    }
    return false;
  }

  /**
   * Convert Prisma.Decimal -> integer cents (or smallest unit) to avoid float
   * drift during arithmetic. ETB has 2 decimal places; multiply by 100 and round.
   */
  private toCents(d: Prisma.Decimal): number {
    return Math.round(Number(d) * 100);
  }

  private fromCents(cents: number): string {
    return (cents / 100).toFixed(2);
  }

  private toDto = (
    s: Prisma.SaleGetPayload<{
      include: {
        items: true;
        customer: { select: { id: true; name: true } };
        cashier: { select: { id: true; name: true } };
      };
    }>,
  ): Sale => ({
    id: s.id,
    customerId: s.customerId,
    customer: s.customer,
    cashierId: s.cashierId,
    cashier: s.cashier ?? undefined,
    subtotal: s.subtotal.toString(),
    discount: s.discount.toString(),
    total: s.total.toString(),
    profit: s.profit.toString(),
    paymentMethod: s.paymentMethod,
    note: s.note,
    items: s.items.map(
      (i): SaleItem => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        buyPriceAtSale: i.buyPriceAtSale.toString(),
        sellPriceAtSale: i.sellPriceAtSale.toString(),
        lineTotal: i.lineTotal.toString(),
        lineProfit: i.lineProfit.toString(),
      }),
    ),
    createdAt: s.createdAt.toISOString(),
  });
}
