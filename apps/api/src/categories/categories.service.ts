import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CreateCategoryInput, UpdateCategoryInput } from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all categories of an organization, including a denormalized
   * `productCount` so the UI can show "Beverages (12)" without an N+1 query.
   */
  async list(organizationId: string) {
    const categories = await this.prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      productCount: c._count.products,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async create(organizationId: string, input: CreateCategoryInput) {
    try {
      const created = await this.prisma.category.create({
        data: { organizationId, name: input.name },
      });
      return { ...created, productCount: 0 };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(
          `A category named "${input.name}" already exists`,
        );
      }
      throw err;
    }
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdateCategoryInput,
  ) {
    await this.ensureOwned(organizationId, id);
    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: input,
        include: { _count: { select: { products: true } } },
      });
      return {
        id: updated.id,
        name: updated.name,
        productCount: updated._count.products,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        throw new ConflictException(
          `A category named "${input.name}" already exists`,
        );
      }
      throw err;
    }
  }

  /**
   * Delete a category. Products referencing it are not removed — their
   * categoryId is set to null (per schema: onDelete: SetNull), so the
   * shop never loses product data because of category housekeeping.
   */
  async remove(organizationId: string, id: string) {
    await this.ensureOwned(organizationId, id);
    await this.prisma.category.delete({ where: { id } });
    return { id, deleted: true };
  }

  private async ensureOwned(organizationId: string, id: string): Promise<void> {
    const found = await this.prisma.category.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException("Category not found");
  }
}
