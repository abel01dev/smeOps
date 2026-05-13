import { topProductsQuerySchema, trendQuerySchema } from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class TrendQueryDto extends createZodDto(trendQuerySchema) {}
export class TopProductsQueryDto extends createZodDto(topProductsQuerySchema) {}
