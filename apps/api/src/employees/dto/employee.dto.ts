import {
  createEmployeeSchema,
  updateEmployeeRoleSchema,
} from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class CreateEmployeeDto extends createZodDto(createEmployeeSchema) {}
export class UpdateEmployeeRoleDto extends createZodDto(updateEmployeeRoleSchema) {}
