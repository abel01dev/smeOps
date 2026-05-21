import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CreateExpenseCategoryInput,
  ExpenseCategory,
  UpdateExpenseCategoryInput,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

const DEFAULT_CATEGORY_NAMES = [
  "Rent",
  "Salaries",
  "Transport",
  "Utilities",
  "Other",
] as const;

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string): Promise<ExpenseCategory[]> {
    await this.ensureDefaults(organizationId);
    const rows = await this.prisma.expenseCategory.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      include: { _count: { select: { expenses: true } } },
    });
    return rows.map((c) => this.toDto(c, c._count.expenses));
  }

  async create(
    organizationId: string,
    dto: CreateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    try {
      const row = await this.prisma.expenseCategory.create({
        data: { organizationId, name: dto.name },
      });
      return this.toDto(row, 0);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("A category with this name already exists");
      }
      throw e;
    }
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateExpenseCategoryInput,
  ): Promise<ExpenseCategory> {
    await this.assertExists(organizationId, id);
    try {
      const row = await this.prisma.expenseCategory.update({
        where: { id },
        data: dto,
        include: { _count: { select: { expenses: true } } },
      });
      return this.toDto(row, row._count.expenses);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException("A category with this name already exists");
      }
      throw e;
    }
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.assertExists(organizationId, id);
    const used = await this.prisma.operationalExpense.count({
      where: { organizationId, categoryId: id },
    });
    if (used > 0) {
      throw new ConflictException(
        "Cannot delete a category that has expenses. Reassign or delete those expenses first.",
      );
    }
    await this.prisma.expenseCategory.delete({ where: { id } });
  }

  private async ensureDefaults(organizationId: string): Promise<void> {
    const count = await this.prisma.expenseCategory.count({
      where: { organizationId },
    });
    if (count > 0) return;
    await this.prisma.expenseCategory.createMany({
      data: DEFAULT_CATEGORY_NAMES.map((name) => ({ organizationId, name })),
    });
  }

  private async assertExists(organizationId: string, id: string) {
    const row = await this.prisma.expenseCategory.findFirst({
      where: { id, organizationId },
    });
    if (!row) throw new NotFoundException("Expense category not found");
  }

  private toDto(
    c: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    },
    expenseCount = 0,
  ): ExpenseCategory {
    return {
      id: c.id,
      name: c.name,
      expenseCount,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
