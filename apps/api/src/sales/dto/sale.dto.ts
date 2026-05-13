import {
  createSaleSchema,
  paginationQuerySchema,
  saleListQuerySchema,
} from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class CreateSaleDto extends createZodDto(createSaleSchema) {}

export class SaleListQueryDto extends createZodDto(
  paginationQuerySchema.merge(saleListQuerySchema),
) {}
