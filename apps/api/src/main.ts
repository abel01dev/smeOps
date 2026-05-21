import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT", 4000);
  const corsOrigin = config.get<string>("CORS_ORIGIN", "http://localhost:3000");
  const nodeEnv = config.get<string>("NODE_ENV", "development");

  app.use(helmet());
  app.enableCors({
    origin: corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  // NOTE: Validation is handled by `ZodValidationPipe` registered globally in
  // AppModule (APP_PIPE). DTOs use createZodDto() so a single zod schema in
  // @sme/shared validates the request body and produces Swagger types.
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(app.get(Reflector)),
  );

  // Swagger / OpenAPI — on in development; set SWAGGER_ENABLED=true in production if needed
  const swaggerEnabled =
    config.get<string>("SWAGGER_ENABLED") === "true" || nodeEnv !== "production";

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("SME Ops Platform API")
      .setDescription(
        [
          "Multi-tenant SaaS API for buy-and-resell SMEs.",
          "",
          "**Auth:** Register or login via `/auth/login`, then click **Authorize** and paste the `accessToken`.",
          "All routes except `/auth/*` (public) and `/health` require a Bearer token.",
          "",
          "See `docs/API.md` in the repo for a quick endpoint reference.",
        ].join("\n"),
      )
      .setVersion("1.0")
      .addServer(`http://localhost:${port}/api/v1`, "Local development")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "access-token",
      )
      .addTag("auth", "Register, login, refresh, current user")
      .addTag("categories", "Product categories")
      .addTag("products", "Inventory / catalog")
      .addTag("customers", "Customer CRM")
      .addTag("sales", "POS checkout + sales history")
      .addTag("dashboard", "KPIs, charts, aggregations")
      .addTag("ai", "Rule-based business insights (no external API)")
      .addTag("ai-assistant", "OpenRouter chat assistant with conversation history")
      .addTag("health", "Liveness and database probe")
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "list",
        filter: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
      customSiteTitle: "SME Ops API",
    });
  }

  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port} (docs at /docs)`);
  // eslint-disable-next-line no-console
  console.log(
    `Mobile/Expo Go: set EXPO_PUBLIC_API_URL=http://<this-machine-LAN-IP>:${port}/api/v1`,
  );
}

bootstrap();
