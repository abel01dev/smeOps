import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  CreateProductInput,
  PaginatedResult,
  Product,
  UpdateProductInput,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

interface ListArgs {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  search?: string;
  categoryId?: string;
  status?: "ACTIVE" | "ARCHIVED";
  lowStockOnly?: boolean;
}

/** Whitelist sortable columns to prevent SQL-injection-like errors. */
const SORTABLE_COLUMNS = new Set([
  "name",
  "sellPrice",
  "buyPrice",
  "stockQuantity",
  "createdAt",
  "updatedAt",
]);

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    args: ListArgs,
  ): Promise<PaginatedResult<Product>> {
    const { page, pageSize, sortDir, search, categoryId, status, lowStockOnly } =
      args;
    const sortBy =
      args.sortBy && SORTABLE_COLUMNS.has(args.sortBy) ? args.sortBy : "createdAt";

    const where: Prisma.ProductWhereInput = {
      organizationId,
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : {}),
      // Postgres needs a column-to-column compare; Prisma supports this via raw
      // filtering. We model "low stock" as: stockQuantity <= minStock AND minStock > 0.
      ...(lowStockOnly
        ? {
            minStock: { gt: 0 },
            stockQuantity: { lte: this.prisma.product.fields.minStock },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(this.toDto),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(organizationId: string, id: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) throw new NotFoundException("Product not found");
    return this.toDto(product);
  }

  async create(organizationId: string, input: CreateProductInput): Promise<Product> {
    if (input.categoryId) {
      await this.ensureCategoryOwned(organizationId, input.categoryId);
    }
    const created = await this.prisma.product.create({
      data: {
        organizationId,
        name: input.name,
        description: input.description ?? null,
        categoryId: input.categoryId ?? null,
        buyPrice: input.buyPrice.toFixed(2),
        sellPrice: input.sellPrice.toFixed(2),
        stockQuantity: input.stockQuantity,
        minStock: input.minStock,
        status: input.status,
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return this.toDto(created);
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateProductInput,
  ): Promise<Product> {
    const existing = await this.prisma.product.findFirst({
      where: { id, organizationId },
      select: { id: true, buyPrice: true, sellPrice: true },
    });
    if (!existing) throw new NotFoundException("Product not found");

    if (input.categoryId) {
      await this.ensureCategoryOwned(organizationId, input.categoryId);
    }

    // Cross-field check: if only one of the two prices is sent, validate against the existing one.
    const finalBuy =
      input.buyPrice ?? Number(existing.buyPrice);
    const finalSell =
      input.sellPrice ?? Number(existing.sellPrice);
    if (finalSell < finalBuy) {
      throw new BadRequestException("Sell price cannot be lower than buy price");
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.categoryId !== undefined
          ? { categoryId: input.categoryId }
          : {}),
        ...(input.buyPrice !== undefined
          ? { buyPrice: input.buyPrice.toFixed(2) }
          : {}),
        ...(input.sellPrice !== undefined
          ? { sellPrice: input.sellPrice.toFixed(2) }
          : {}),
        ...(input.stockQuantity !== undefined
          ? { stockQuantity: input.stockQuantity }
          : {}),
        ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return this.toDto(updated);
  }

  /**
   * Soft-archive a product. We never hard-delete because SaleItem.productId
   * has onDelete: Restrict — past sales reference this row forever.
   * Operators who want it hidden from search/POS should set status=ARCHIVED.
   */
  async archive(organizationId: string, id: string): Promise<Product> {
    return this.update(organizationId, id, { status: "ARCHIVED" });
  }

  // -------------------- helpers --------------------

  private async ensureCategoryOwned(
    organizationId: string,
    categoryId: string,
  ): Promise<void> {
    const c = await this.prisma.category.findFirst({
      where: { id: categoryId, organizationId },
      select: { id: true },
    });
    if (!c) {
      throw new BadRequestException("Category does not exist in this organization");
    }
  }

  private toDto = (
    p: Prisma.ProductGetPayload<{
      include: { category: { select: { id: true; name: true } } };
    }>,
  ): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    category: p.category,
    buyPrice: p.buyPrice.toString(),
    sellPrice: p.sellPrice.toString(),
    stockQuantity: p.stockQuantity,
    minStock: p.minStock,
    status: p.status,
    isLowStock: p.minStock > 0 && p.stockQuantity <= p.minStock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  });
}
