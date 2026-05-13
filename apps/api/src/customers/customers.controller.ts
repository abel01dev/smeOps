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

import { OrganizationId } from "../auth/decorators/current-user.decorator";
import { CustomersService } from "./customers.service";
import {
  CreateCustomerDto,
  CustomerListQueryDto,
  UpdateCustomerDto,
} from "./dto/customer.dto";

@ApiTags("customers")
@ApiBearerAuth("access-token")
@Controller({ path: "customers", version: "1" })
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @ApiOperation({ summary: "Paginated customer list with name/phone search" })
  list(
    @OrganizationId() organizationId: string,
    @Query() query: CustomerListQueryDto,
  ) {
    return this.customers.list(organizationId, query);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Customer detail with the last 10 sales (for the profile page)",
  })
  findOne(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
  ) {
    return this.customers.findOne(organizationId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a customer" })
  create(
    @OrganizationId() organizationId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customers.create(organizationId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a customer" })
  update(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customers.update(organizationId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({
    summary: "Delete a customer (past sales are preserved, anonymized)",
  })
  remove(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
  ) {
    return this.customers.remove(organizationId, id);
  }
}
