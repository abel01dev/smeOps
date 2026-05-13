import { z } from "zod";

export const PRODUCT_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
export const productStatusSchema = z.enum(PRODUCT_STATUSES);
export type ProductStatus = z.infer<typeof productStatusSchema>;

/**
 * Prices accept numbers OR numeric strings (since HTML inputs return strings and
 * Prisma Decimal serializes as string). We coerce and validate >= 0.
 */
const priceSchema = z.coerce
  .number({ invalid_type_error: "Must be a number" })
  .nonnegative("Must be 0 or greater")
  .max(99_999_999.99, "Value is too large");

const quantitySchema = z.coerce
  .number({ invalid_type_error: "Must be a number" })
  .int("Must be a whole number")
  .nonnegative("Must be 0 or greater")
  .max(1_000_000, "Quantity is too large");

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required").max(120),
    description: z.string().trim().max(500).optional().nullable(),
    categoryId: z.string().cuid().optional().nullable(),
    buyPrice: priceSchema,
    sellPrice: priceSchema,
    stockQuantity: quantitySchema.default(0),
    minStock: quantitySchema.default(0),
    status: productStatusSchema.default("ACTIVE"),
  })
  .refine((d) => d.sellPrice >= d.buyPrice, {
    message: "Sell price cannot be lower than buy price",
    path: ["sellPrice"],
  });

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).optional().nullable(),
    categoryId: z.string().cuid().optional().nullable(),
    buyPrice: priceSchema.optional(),
    sellPrice: priceSchema.optional(),
    stockQuantity: quantitySchema.optional(),
    minStock: quantitySchema.optional(),
    status: productStatusSchema.optional(),
  })
  .refine(
    (d) =>
      d.buyPrice === undefined ||
      d.sellPrice === undefined ||
      d.sellPrice >= d.buyPrice,
    { message: "Sell price cannot be lower than buy price", path: ["sellPrice"] },
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/** Query params for GET /products. Merge with paginationQuerySchema in the DTO. */
export const productListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  categoryId: z.string().cuid().optional(),
  status: productStatusSchema.optional(),
  lowStockOnly: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .transform((v) => v === true || v === "true")
    .optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  buyPrice: string;
  sellPrice: string;
  stockQuantity: number;
  minStock: number;
  status: ProductStatus;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}
