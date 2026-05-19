import { createZodDto } from "nestjs-zod";
import { aiInsightsQuerySchema } from "@sme/shared";

export class AiInsightsQueryDto extends createZodDto(aiInsightsQuerySchema) {}
