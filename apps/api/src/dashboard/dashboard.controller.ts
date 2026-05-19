import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { OrganizationId } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { API_ROLE_ACCESS } from "../auth/permissions";
import { DashboardService } from "./dashboard.service";

const { dashboard: DASHBOARD_ROLES } = API_ROLE_ACCESS;
import { TopProductsQueryDto, TrendQueryDto } from "./dto/dashboard.dto";

@ApiTags("dashboard")
@ApiBearerAuth("access-token")
@Roles(...DASHBOARD_ROLES)
@Controller({ path: "dashboard", version: "1" })
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("summary")
  @ApiOperation({
    summary: "KPI cards: today/week/month revenue + profit, low-stock count, totals",
  })
  summary(@OrganizationId() organizationId: string) {
    return this.dashboard.summary(organizationId);
  }

  @Get("revenue-trend")
  @ApiOperation({
    summary: "Daily revenue + profit + sales count for the last N days",
    description:
      "Returns one bucket per day even if there are zero sales (flat 0 on the chart).",
  })
  trend(
    @OrganizationId() organizationId: string,
    @Query() query: TrendQueryDto,
  ) {
    return this.dashboard.revenueTrend(organizationId, query.days);
  }

  @Get("top-products")
  @ApiOperation({
    summary: "Top N products by revenue in the last N days",
  })
  topProducts(
    @OrganizationId() organizationId: string,
    @Query() query: TopProductsQueryDto,
  ) {
    return this.dashboard.topProducts(organizationId, query.days, query.limit);
  }
}
