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
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import {
  CurrentUser,
  OrganizationId,
  type RequestUser,
} from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { API_ROLE_ACCESS } from "../auth/permissions";
import {
  CreateOperationalExpenseDto,
  ExpenseListQueryDto,
  UpdateOperationalExpenseDto,
} from "./dto/expense.dto";
import { ExpensesService } from "./expenses.service";

@ApiTags("expenses")
@ApiBearerAuth("access-token")
@Controller({ path: "expenses", version: "1" })
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  @Roles(...API_ROLE_ACCESS.expensesRead)
  @ApiOperation({ summary: "Paginated operational expenses list" })
  list(
    @OrganizationId() organizationId: string,
    @Query() query: ExpenseListQueryDto,
  ) {
    return this.expenses.list(organizationId, query);
  }

  @Get(":id")
  @Roles(...API_ROLE_ACCESS.expensesRead)
  @ApiOperation({ summary: "Get one operational expense" })
  findOne(@OrganizationId() organizationId: string, @Param("id") id: string) {
    return this.expenses.findOne(organizationId, id);
  }

  @Post()
  @Roles(...API_ROLE_ACCESS.expensesWrite)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Record an operational expense (rent, salary, etc.)" })
  create(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateOperationalExpenseDto,
  ) {
    return this.expenses.create(organizationId, user.id, dto);
  }

  @Patch(":id")
  @Roles(...API_ROLE_ACCESS.expensesWrite)
  @ApiOperation({ summary: "Update an operational expense" })
  update(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
    @Body() dto: UpdateOperationalExpenseDto,
  ) {
    return this.expenses.update(organizationId, id, dto);
  }

  @Delete(":id")
  @Roles(...API_ROLE_ACCESS.expensesWrite)
  @ApiOperation({ summary: "Delete an operational expense" })
  remove(@OrganizationId() organizationId: string, @Param("id") id: string) {
    return this.expenses.remove(organizationId, id);
  }
}
