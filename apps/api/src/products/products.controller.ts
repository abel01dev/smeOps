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
import { Roles } from "../auth/decorators/roles.decorator";
import { API_ROLE_ACCESS } from "../auth/permissions";
import {
  CreateProductDto,
  ProductListQueryDto,
  UpdateProductDto,
} from "./dto/product.dto";
import { ProductsService } from "./products.service";

@ApiTags("products")
@ApiBearerAuth("access-token")
@Controller({ path: "products", version: "1" })
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  @Roles(...API_ROLE_ACCESS.productsRead)
  @ApiOperation({
    summary: "Paginated, searchable, filterable product list",
    description:
      "Supports ?search, ?categoryId, ?status, ?lowStockOnly, plus standard pagination.",
  })
  list(
    @OrganizationId() organizationId: string,
    @Query() query: ProductListQueryDto,
  ) {
    return this.products.list(organizationId, query);
  }

  @Get(":id")
  @Roles(...API_ROLE_ACCESS.productsRead)
  @ApiOperation({ summary: "Get a single product by id" })
  findOne(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
  ) {
    return this.products.findOne(organizationId, id);
  }

  @Post()
  @Roles(...API_ROLE_ACCESS.productsWrite)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new product" })
  create(
    @OrganizationId() organizationId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.products.create(organizationId, dto);
  }

  @Patch(":id")
  @Roles(...API_ROLE_ACCESS.productsWrite)
  @ApiOperation({ summary: "Update a product (partial)" })
  update(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(organizationId, id, dto);
  }

  @Delete(":id")
  @Roles(...API_ROLE_ACCESS.productsWrite)
  @ApiOperation({
    summary: "Archive a product (soft delete — past sales are preserved)",
  })
  archive(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
  ) {
    return this.products.archive(organizationId, id);
  }
}
