import {
  createCustomerSchema,
  paginationQuerySchema,
  updateCustomerSchema,
} from "@sme/shared";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}
export class UpdateCustomerDto extends createZodDto(updateCustomerSchema) {}

export class CustomerListQueryDto extends createZodDto(
  paginationQuerySchema.merge(
    z.object({
      search: z.string().trim().max(120).optional(),
    }),
  ),
) {}
