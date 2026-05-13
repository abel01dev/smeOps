import {
  createProductSchema,
  paginationQuerySchema,
  productListQuerySchema,
  updateProductSchema,
} from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class CreateProductDto extends createZodDto(createProductSchema) {}
export class UpdateProductDto extends createZodDto(updateProductSchema) {}

/** Merge pagination + product-specific filters in one DTO. */
export class ProductListQueryDto extends createZodDto(
  paginationQuerySchema.merge(productListQuerySchema),
) {}
