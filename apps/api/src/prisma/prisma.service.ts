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
    // Don't block app startup if the first DB handshake is slow (e.g. cold
    // pooler / distant region). The pool will lazily connect on first query.
    this.$connect()
      .then(() => this.logger.log("Prisma connected"))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Prisma initial connect failed: ${message}`);
      });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
