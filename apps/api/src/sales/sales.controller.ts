import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import {
  CurrentUser,
  OrganizationId,
  type RequestUser,
} from "../auth/decorators/current-user.decorator";
import { CreateSaleDto, SaleListQueryDto } from "./dto/sale.dto";
import { SalesService } from "./sales.service";

@ApiTags("sales")
@ApiBearerAuth("access-token")
@Controller({ path: "sales", version: "1" })
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Record a sale (atomic: items + stock + customer total in one tx)",
    description:
      "Snapshots product names + prices at the moment of sale, validates stock atomically, and rolls back the entire transaction on any failure.",
  })
  create(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateSaleDto,
  ) {
    return this.sales.create(organizationId, user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: "Paginated sale list with date-range / customer / payment filters",
  })
  list(
    @OrganizationId() organizationId: string,
    @Query() query: SaleListQueryDto,
  ) {
    return this.sales.list(organizationId, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single sale by id" })
  findOne(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
  ) {
    return this.sales.findOne(organizationId, id);
  }
}
