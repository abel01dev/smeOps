import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CreateCustomerInput,
  Customer,
  PaginatedResult,
  UpdateCustomerInput,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

interface ListArgs {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  search?: string;
}

const SORTABLE_COLUMNS = new Set([
  "name",
  "totalSpent",
  "createdAt",
  "updatedAt",
]);

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    args: ListArgs,
  ): Promise<PaginatedResult<Customer>> {
    const { page, pageSize, sortDir, search } = args;
    const sortBy =
      args.sortBy && SORTABLE_COLUMNS.has(args.sortBy) ? args.sortBy : "createdAt";

    const where: Prisma.CustomerWhereInput = {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { sales: true } } },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        address: c.address,
        totalSpent: c.totalSpent.toString(),
        salesCount: c._count.sales,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /**
   * Single customer with recent sales (last 10) — powers the customer detail
   * page in the web app.
   */
  async findOne(organizationId: string, id: string) {
    const c = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: {
        _count: { select: { sales: true } },
        sales: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            total: true,
            paymentMethod: true,
            createdAt: true,
            items: {
              select: { productName: true, quantity: true, lineTotal: true },
            },
          },
        },
      },
    });
    if (!c) throw new NotFoundException("Customer not found");

    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address,
      totalSpent: c.totalSpent.toString(),
      salesCount: c._count.sales,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      recentSales: c.sales.map((s) => ({
        id: s.id,
        total: s.total.toString(),
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt.toISOString(),
        items: s.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          lineTotal: i.lineTotal.toString(),
        })),
      })),
    };
  }

  async create(
    organizationId: string,
    input: CreateCustomerInput,
  ): Promise<Customer> {
    const created = await this.prisma.customer.create({
      data: {
        organizationId,
        name: input.name,
        phone: input.phone ?? null,
        address: input.address ?? null,
      },
    });
    return this.toDto(created, 0);
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateCustomerInput,
  ): Promise<Customer> {
    await this.ensureOwned(organizationId, id);
    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
      },
      include: { _count: { select: { sales: true } } },
    });
    return this.toDto(updated, updated._count.sales);
  }

  /**
   * Delete a customer. Past sales reference customerId with onDelete: SetNull,
   * so sales records are preserved (customer becomes anonymized).
   */
  async remove(organizationId: string, id: string) {
    await this.ensureOwned(organizationId, id);
    await this.prisma.customer.delete({ where: { id } });
    return { id, deleted: true };
  }

  // -------------------- helpers --------------------

  private async ensureOwned(organizationId: string, id: string): Promise<void> {
    const c = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!c) throw new NotFoundException("Customer not found");
  }

  private toDto = (
    c: {
      id: string;
      name: string;
      phone: string | null;
      address: string | null;
      totalSpent: Prisma.Decimal;
      createdAt: Date;
      updatedAt: Date;
    },
    salesCount: number,
  ): Customer => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    totalSpent: c.totalSpent.toString(),
    salesCount,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  });
}
