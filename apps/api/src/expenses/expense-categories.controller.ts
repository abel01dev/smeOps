import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { OrganizationId } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { API_ROLE_ACCESS } from "../auth/permissions";
import { ExpenseCategoriesService } from "./expense-categories.service";
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from "./dto/expense.dto";

@ApiTags("expense-categories")
@ApiBearerAuth("access-token")
@Controller({ path: "expense-categories", version: "1" })
export class ExpenseCategoriesController {
  constructor(private readonly categories: ExpenseCategoriesService) {}

  @Get()
  @Roles(...API_ROLE_ACCESS.expensesRead)
  @ApiOperation({
    summary: "List expense categories (auto-seeds defaults on first call)",
  })
  list(@OrganizationId() organizationId: string) {
    return this.categories.list(organizationId);
  }

  @Post()
  @Roles(...API_ROLE_ACCESS.expensesWrite)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create an expense category" })
  create(
    @OrganizationId() organizationId: string,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.categories.create(organizationId, dto);
  }

  @Patch(":id")
  @Roles(...API_ROLE_ACCESS.expensesWrite)
  @ApiOperation({ summary: "Update an expense category" })
  update(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    return this.categories.update(organizationId, id, dto);
  }

  @Delete(":id")
  @Roles(...API_ROLE_ACCESS.expensesWrite)
  @ApiOperation({ summary: "Delete an expense category" })
  remove(@OrganizationId() organizationId: string, @Param("id") id: string) {
    return this.categories.remove(organizationId, id);
  }
}
