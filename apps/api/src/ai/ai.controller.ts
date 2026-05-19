import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

import { OrganizationId } from "../auth/decorators/current-user.decorator";
import { AiService } from "./ai.service";
import { AiInsightsQueryDto } from "./dto/ai.dto";

@ApiTags("ai")
@ApiBearerAuth("access-token")
@Controller({ path: "ai", version: "1" })
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("insights")
  @ApiOperation({
    summary: "Rule-based business insights and simple forecasts",
    description:
      "Deterministic analysis of sales, inventory, and trends. No external AI API required.",
  })
  getInsights(
    @OrganizationId() organizationId: string,
    @Query() query: AiInsightsQueryDto,
  ) {
    return this.ai.insights(organizationId, query.days);
  }
}
