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
  RecordSalePaymentInput,
  Sale,
  SaleItem,
  SalePaymentStatus,
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
  paymentStatus?: SalePaymentStatus;
  hasBalance?: boolean;
}

const SORTABLE_COLUMNS = new Set(["createdAt", "total", "profit"]);

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

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
      let customer: {
        id: string;
        outstandingBalance: Prisma.Decimal;
        creditLimit: Prisma.Decimal | null;
      } | null = null;

      if (input.customerId) {
        customer = await tx.customer.findFirst({
          where: { id: input.customerId, organizationId },
          select: {
            id: true,
            outstandingBalance: true,
            creditLimit: true,
          },
        });
        if (!customer) throw new BadRequestException("Customer not found");
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
      const finalProfitCents = profitCents - discountCents;

      const payment = this.resolvePayment(
        input.paymentStatus,
        totalCents,
        Math.round(input.amountPaid * 100),
      );

      if (payment.amountPaidCents > totalCents) {
        throw new BadRequestException(
          "Amount paid cannot exceed the sale total",
        );
      }

      if (customer && payment.amountDueCents > 0) {
        const newBalanceCents =
          this.toCents(customer.outstandingBalance) + payment.amountDueCents;
        if (customer.creditLimit != null) {
          const limitCents = this.toCents(customer.creditLimit);
          if (newBalanceCents > limitCents) {
            throw new BadRequestException(
              "This sale would exceed the customer's credit limit",
            );
          }
        }
      }

      const salePaymentMethod = this.resolveSalePaymentMethod(
        input.paymentMethod,
        payment.status,
        payment.amountPaidCents,
      );

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
          throw new ConflictException(
            "Stock changed while processing this sale. Please refresh and try again.",
          );
        }
      }

      const created = await tx.sale.create({
        data: {
          organizationId,
          customerId: input.customerId ?? null,
          cashierId,
          subtotal: this.fromCents(subtotalCents),
          discount: this.fromCents(discountCents),
          total: this.fromCents(totalCents),
          profit: this.fromCents(finalProfitCents),
          paymentMethod: salePaymentMethod,
          paymentStatus: payment.status,
          amountPaid: this.fromCents(payment.amountPaidCents),
          amountDue: this.fromCents(payment.amountDueCents),
          dueDate: input.dueDate ?? null,
          note: input.note ?? null,
          items: { create: itemRows },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          cashier: { select: { id: true, name: true } },
        },
      });

      if (input.customerId) {
        await tx.customer.update({
          where: { id: input.customerId },
          data: {
            totalSpent: { increment: this.fromCents(totalCents) },
            ...(payment.amountDueCents > 0
              ? {
                  outstandingBalance: {
                    increment: this.fromCents(payment.amountDueCents),
                  },
                }
              : {}),
          },
        });
      }

      if (payment.amountPaidCents > 0 && input.customerId) {
        await tx.customerPayment.create({
          data: {
            organizationId,
            customerId: input.customerId,
            saleId: created.id,
            amount: this.fromCents(payment.amountPaidCents),
            paymentMethod: salePaymentMethod,
            recordedById: cashierId,
            note: "Deposit at checkout",
          },
        });
      }

      return this.toDto(created);
    });
  }

  async recordPayment(
    organizationId: string,
    recordedById: string,
    saleId: string,
    input: RecordSalePaymentInput,
  ): Promise<Sale> {
    const amountCents = Math.round(input.amount * 100);
    if (amountCents <= 0) {
      throw new BadRequestException("Amount must be greater than 0");
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, organizationId },
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          cashier: { select: { id: true, name: true } },
        },
      });
      if (!sale) throw new NotFoundException("Sale not found");
      if (!sale.customerId) {
        throw new BadRequestException("This sale has no customer on file");
      }
      if (sale.paymentStatus === "PAID") {
        throw new BadRequestException("This sale is already fully paid");
      }

      const dueCents = this.toCents(sale.amountDue);
      if (amountCents > dueCents) {
        throw new BadRequestException(
          `Payment exceeds balance due (${(dueCents / 100).toFixed(2)})`,
        );
      }

      const newPaidCents = this.toCents(sale.amountPaid) + amountCents;
      const newDueCents = dueCents - amountCents;
      const newStatus: SalePaymentStatus =
        newDueCents === 0 ? "PAID" : "PARTIAL";

      await tx.customerPayment.create({
        data: {
          organizationId,
          customerId: sale.customerId,
          saleId: sale.id,
          amount: this.fromCents(amountCents),
          paymentMethod: input.paymentMethod,
          recordedById,
          note: input.note ?? null,
        },
      });

      const updated = await tx.sale.update({
        where: { id: sale.id },
        data: {
          amountPaid: this.fromCents(newPaidCents),
          amountDue: this.fromCents(newDueCents),
          paymentStatus: newStatus,
          ...(newStatus === "PAID"
            ? { paymentMethod: input.paymentMethod }
            : {}),
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true } },
          cashier: { select: { id: true, name: true } },
        },
      });

      await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          outstandingBalance: { decrement: this.fromCents(amountCents) },
        },
      });

      return this.toDto(updated);
    });
  }

  async list(
    organizationId: string,
    args: ListArgs,
  ): Promise<PaginatedResult<Sale>> {
    const {
      page,
      pageSize,
      sortDir,
      dateFrom,
      dateTo,
      customerId,
      paymentMethod,
      paymentStatus,
      hasBalance,
    } = args;
    const sortBy =
      args.sortBy && SORTABLE_COLUMNS.has(args.sortBy) ? args.sortBy : "createdAt";

    const where: Prisma.SaleWhereInput = {
      organizationId,
      ...(customerId ? { customerId } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(hasBalance === true
        ? { paymentStatus: { in: ["PARTIAL", "UNPAID"] } }
        : hasBalance === false
          ? { paymentStatus: "PAID" }
          : {}),
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

  private resolvePayment(
    requestedStatus: SalePaymentStatus,
    totalCents: number,
    amountPaidCents: number,
  ): {
    status: SalePaymentStatus;
    amountPaidCents: number;
    amountDueCents: number;
  } {
    if (requestedStatus === "PAID") {
      return {
        status: "PAID",
        amountPaidCents: totalCents,
        amountDueCents: 0,
      };
    }
    if (requestedStatus === "UNPAID") {
      return {
        status: "UNPAID",
        amountPaidCents: 0,
        amountDueCents: totalCents,
      };
    }
    // PARTIAL
    if (amountPaidCents <= 0 || amountPaidCents >= totalCents) {
      throw new BadRequestException(
        "Partial payment requires a deposit greater than 0 and less than the total",
      );
    }
    return {
      status: "PARTIAL",
      amountPaidCents,
      amountDueCents: totalCents - amountPaidCents,
    };
  }

  private resolveSalePaymentMethod(
    requested: PaymentMethod,
    status: SalePaymentStatus,
    amountPaidCents: number,
  ): PaymentMethod {
    if (status === "UNPAID") return "CREDIT";
    if (amountPaidCents > 0 && requested !== "CREDIT") return requested;
    if (amountPaidCents > 0) return "CASH";
    return "CREDIT";
  }

  private hasDuplicateProductIds(items: Array<{ productId: string }>): boolean {
    const seen = new Set<string>();
    for (const i of items) {
      if (seen.has(i.productId)) return true;
      seen.add(i.productId);
    }
    return false;
  }

  private toCents(d: Prisma.Decimal | string | number): number {
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
    paymentStatus: s.paymentStatus,
    amountPaid: s.amountPaid.toString(),
    amountDue: s.amountDue.toString(),
    dueDate: s.dueDate?.toISOString() ?? null,
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
