import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { EmployeeSummary } from "@sme/shared";
import { UserRole } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { SupabaseService } from "../auth/supabase.service";
import type { CreateEmployeeDto, UpdateEmployeeRoleDto } from "./dto/employee.dto";

const INVITABLE_ROLES = new Set<UserRole>([
  UserRole.MANAGER,
  UserRole.INVENTORY_MANAGER,
  UserRole.CASHIER,
]);

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async list(organizationId: string): Promise<EmployeeSummary[]> {
    const rows = await this.prisma.user.findMany({
      where: { organizationId },
      orderBy: [{ role: "asc" }, { email: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as EmployeeSummary["role"],
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async create(
    organizationId: string,
    input: CreateEmployeeDto,
  ): Promise<EmployeeSummary> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const role = input.role as UserRole;
    if (!INVITABLE_ROLES.has(role)) {
      throw new BadRequestException("Invalid role for a new employee");
    }

    const { data: created, error: createErr } =
      await this.supabase.admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { name: input.name },
      });

    if (createErr || !created.user) {
      this.logger.error(
        `Supabase createUser failed for ${input.email}: ${createErr?.message}`,
      );
      if (createErr?.message?.toLowerCase().includes("already")) {
        throw new ConflictException("An account with this email already exists");
      }
      throw new BadRequestException(
        createErr?.message ?? "Could not create auth account for this employee",
      );
    }

    const supabaseUserId = created.user.id;

    try {
      const user = await this.prisma.user.create({
        data: {
          id: supabaseUserId,
          organizationId,
          email: input.email,
          name: input.name,
          role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as EmployeeSummary["role"],
        createdAt: user.createdAt.toISOString(),
      };
    } catch (err) {
      await this.supabase.admin.auth.admin.deleteUser(supabaseUserId).catch((e) => {
        this.logger.error(
          `Failed to delete orphan Supabase user ${supabaseUserId}: ${(e as Error).message}`,
        );
      });
      throw err;
    }
  }

  async updateRole(
    organizationId: string,
    userId: string,
    input: UpdateEmployeeRoleDto,
  ): Promise<EmployeeSummary> {
    const nextRole = input.role as UserRole;
    if (!INVITABLE_ROLES.has(nextRole)) {
      throw new BadRequestException("Invalid role");
    }

    const target = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
    });
    if (!target) {
      throw new NotFoundException("Employee not found");
    }
    if (target.role === UserRole.OWNER) {
      throw new BadRequestException("Cannot change the organization owner's role");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: nextRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role as EmployeeSummary["role"],
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
