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
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
