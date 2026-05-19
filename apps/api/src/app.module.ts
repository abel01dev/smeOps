import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";

import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { SupabaseAuthGuard } from "./auth/guards/supabase-auth.guard";
import { CategoriesModule } from "./categories/categories.module";
import { envValidation } from "./config/env.validation";
import { CustomersModule } from "./customers/customers.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { SalesModule } from "./sales/sales.module";

/**
 * Application root.
 *
 * Global wiring:
 *   - ConfigModule (env validation, fail-fast)
 *   - PrismaModule (global Prisma client)
 *   - AuthModule  (register/login/refresh/me)
 *   - SupabaseAuthGuard registered as APP_GUARD => every route is protected
 *     unless explicitly marked @Public(). Safe-by-default tenant isolation.
 *   - ZodValidationPipe registered as APP_PIPE => DTOs declared with
 *     createZodDto() are validated automatically.
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
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CustomersModule,
    SalesModule,
    DashboardModule,
    AiModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
