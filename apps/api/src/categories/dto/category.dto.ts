import { createCategorySchema, updateCategorySchema } from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class CreateCategoryDto extends createZodDto(createCategorySchema) {}
export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
