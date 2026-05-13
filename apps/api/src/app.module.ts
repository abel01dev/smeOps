import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { envValidation } from "./config/env.validation";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";

/**
 * Application root.
 *
 * Module wiring rationale:
 *   - ConfigModule is global so any service can inject ConfigService.
 *   - PrismaModule is global so we don't have to re-import in every feature module.
 *   - Feature modules (auth, products, sales, ...) will be added Day 2+.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [".env.local", ".env"],
      validate: envValidation,
    }),
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
