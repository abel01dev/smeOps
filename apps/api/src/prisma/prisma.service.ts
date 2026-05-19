import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * PrismaService — single Prisma client for the whole app.
 *
 * Notes:
 *  - We deliberately keep this thin. Tenant scoping will be added via a Prisma
 *    client extension in Day 2 once the auth + tenant guard land. Doing it at
 *    the ORM level (instead of remembering to add `where: { organizationId }`
 *    everywhere) is the difference between a leaky multi-tenant app and a safe one.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Retry a few times — Supabase can be slow to wake (free tier) or flaky on
    // first pooler handshake over distant regions.
    void this.connectWithRetry();
  }

  private async connectWithRetry(attempt = 1, maxAttempts = 4): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Prisma connected");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt >= maxAttempts) {
        this.logger.error(
          `Prisma connect failed after ${maxAttempts} attempts: ${message}`,
        );
        return;
      }
      const delayMs = attempt * 3_000;
      this.logger.warn(
        `Prisma connect attempt ${attempt}/${maxAttempts} failed — retrying in ${delayMs / 1000}s`,
      );
      await new Promise((r) => setTimeout(r, delayMs));
      return this.connectWithRetry(attempt + 1, maxAttempts);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
