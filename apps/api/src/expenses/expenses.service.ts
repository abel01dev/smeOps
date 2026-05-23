import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CreateOperationalExpenseInput,
  ExpenseListResult,
  OperationalExpense,
  UpdateOperationalExpenseInput,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";
import type { ExpenseListQueryDto } from "./dto/expense.dto";

const SORTABLE_COLUMNS = new Set([
  "expenseDate",
  "amount",
  "createdAt",
  "updatedAt",
]);

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: ExpenseListQueryDto,
  ): Promise<ExpenseListResult> {
    const { page, pageSize, sortDir, search, categoryId, from, to } = query;
    const sortBy =
      query.sortBy && SORTABLE_COLUMNS.has(query.sortBy)
        ? query.sortBy
        : "expenseDate";

    const where: Prisma.OperationalExpenseWhereInput = {
      organizationId,
      ...(categoryId ? { categoryId } : {}),
      ...(from || to
        ? {
            expenseDate: {
              ...(from ? { gte: parseDateStart(from) } : {}),
              ...(to ? { lte: parseDateEnd(to) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: "insensitive" } },
              { note: { contains: search, mode: "insensitive" } },
              { category: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [items, total, periodAgg] = await this.prisma.$transaction([
      this.prisma.operationalExpense.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { name: true } },
          recordedBy: { select: { name: true } },
        },
      }),
      this.prisma.operationalExpense.count({ where }),
      this.prisma.operationalExpense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    const periodTotal = periodAgg._sum.amount
      ? periodAgg._sum.amount.toString()
      : "0.00";

    return {
      items: items.map((e) => this.toDto(e)),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      periodTotal,
    };
  }

  async findOne(
    organizationId: string,
    id: string,
  ): Promise<OperationalExpense> {
    const e = await this.prisma.operationalExpense.findFirst({
      where: { id, organizationId },
      include: {
        category: { select: { name: true } },
        recordedBy: { select: { name: true } },
      },
    });
    if (!e) throw new NotFoundException("Expense not found");
    return this.toDto(e);
  }

  async create(
    organizationId: string,
    recordedById: string,
    dto: CreateOperationalExpenseInput,
  ): Promise<OperationalExpense> {
    await this.assertCategory(organizationId, dto.categoryId);

    const row = await this.prisma.operationalExpense.create({
      data: {
        organizationId,
        categoryId: dto.categoryId,
        recordedById,
        amount: dto.amount,
        description: dto.description ?? null,
        expenseDate: parseDateStart(dto.expenseDate),
        paymentMethod: dto.paymentMethod,
        note: dto.note ?? null,
      },
      include: {
        category: { select: { name: true } },
        recordedBy: { select: { name: true } },
      },
    });
    return this.toDto(row);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateOperationalExpenseInput,
  ): Promise<OperationalExpense> {
    await this.findOne(organizationId, id);
    if (dto.categoryId) {
      await this.assertCategory(organizationId, dto.categoryId);
    }

    const row = await this.prisma.operationalExpense.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.expenseDate !== undefined
          ? { expenseDate: parseDateStart(dto.expenseDate) }
          : {}),
        ...(dto.paymentMethod !== undefined
          ? { paymentMethod: dto.paymentMethod }
          : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
      },
      include: {
        category: { select: { name: true } },
        recordedBy: { select: { name: true } },
      },
    });
    return this.toDto(row);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.findOne(organizationId, id);
    await this.prisma.operationalExpense.delete({ where: { id } });
  }

  private async assertCategory(organizationId: string, categoryId: string) {
    const cat = await this.prisma.expenseCategory.findFirst({
      where: { id: categoryId, organizationId },
    });
    if (!cat) throw new NotFoundException("Expense category not found");
  }

  private toDto(e: {
    id: string;
    categoryId: string;
    amount: Prisma.Decimal;
    description: string | null;
    expenseDate: Date;
    paymentMethod: import("@prisma/client").PaymentMethod;
    note: string | null;
    recordedById: string;
    createdAt: Date;
    updatedAt: Date;
    category: { name: string };
    recordedBy: { name: string };
  }): OperationalExpense {
    return {
      id: e.id,
      categoryId: e.categoryId,
      categoryName: e.category.name,
      amount: e.amount.toString(),
      description: e.description,
      expenseDate: dayKey(e.expenseDate),
      paymentMethod: e.paymentMethod as OperationalExpense["paymentMethod"],
      note: e.note,
      recordedById: e.recordedById,
      recordedByName: e.recordedBy.name,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}

function parseDateStart(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const out = new Date(y, m - 1, d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function parseDateEnd(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const out = new Date(y, m - 1, d);
  out.setHours(23, 59, 59, 999);
  return out;
}

function dayKey(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
