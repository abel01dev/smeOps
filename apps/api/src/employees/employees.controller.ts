import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { EmployeeSummary } from "@sme/shared";

import { OrganizationId } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { API_ROLE_ACCESS } from "../auth/permissions";
import { CreateEmployeeDto, UpdateEmployeeRoleDto } from "./dto/employee.dto";
import { EmployeesService } from "./employees.service";

@ApiTags("employees")
@ApiBearerAuth("access-token")
@Roles(...API_ROLE_ACCESS.employees)
@Controller({ path: "employees", version: "1" })
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: "List all users in your organization (owner only)" })
  list(@OrganizationId() organizationId: string): Promise<EmployeeSummary[]> {
    return this.employees.list(organizationId);
  }

  @Post()
  @ApiOperation({
    summary:
      "Create an employee: Supabase auth user + profile (owner only). They share the same login page.",
  })
  create(
    @OrganizationId() organizationId: string,
    @Body() body: CreateEmployeeDto,
  ): Promise<EmployeeSummary> {
    return this.employees.create(organizationId, body);
  }

  @Patch(":id/role")
  @ApiOperation({
    summary: "Change an employee's role (cannot change OWNER)",
  })
  updateRole(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
    @Body() body: UpdateEmployeeRoleDto,
  ): Promise<EmployeeSummary> {
    return this.employees.updateRole(organizationId, id, body);
  }
}
