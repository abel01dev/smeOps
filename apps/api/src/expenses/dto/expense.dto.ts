import {
  createExpenseCategorySchema,
  createOperationalExpenseSchema,
  expenseListQuerySchema,
  updateExpenseCategorySchema,
  updateOperationalExpenseSchema,
} from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class CreateExpenseCategoryDto extends createZodDto(
  createExpenseCategorySchema,
) {}
export class UpdateExpenseCategoryDto extends createZodDto(
  updateExpenseCategorySchema,
) {}

export class CreateOperationalExpenseDto extends createZodDto(
  createOperationalExpenseSchema,
) {}
export class UpdateOperationalExpenseDto extends createZodDto(
  updateOperationalExpenseSchema,
) {}

export class ExpenseListQueryDto extends createZodDto(expenseListQuerySchema) {}
