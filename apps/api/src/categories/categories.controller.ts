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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@ApiTags("categories")
@ApiBearerAuth("access-token")
@Controller({ path: "categories", version: "1" })
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: "List all categories in the current organization" })
  list(@OrganizationId() organizationId: string) {
    return this.categories.list(organizationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new category" })
  create(
    @OrganizationId() organizationId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categories.create(organizationId, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a category" })
  update(
    @OrganizationId() organizationId: string,
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(organizationId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a category (products keep their data)" })
  remove(@OrganizationId() organizationId: string, @Param("id") id: string) {
    return this.categories.remove(organizationId, id);
  }
}
