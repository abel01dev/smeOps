import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import type {
  AuthResponse as SharedAuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@sme/shared";

import { PrismaService } from "../prisma/prisma.service";
import { SupabaseService } from "./supabase.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * Register a new business + owner in one atomic flow.
   *
   * Steps:
   *  1. Create the user in Supabase Auth (auto-confirmed for MVP).
   *  2. Create the Organization + linked User row in our DB inside a Prisma
   *     transaction.
   *  3. If step 2 fails, delete the Supabase user we just created so the user
   *     can retry registration cleanly (no orphans).
   *  4. Issue a Supabase session (access + refresh tokens).
   */
  async register(input: RegisterInput): Promise<SharedAuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const slug = await this.uniqueSlug(input.organizationName);

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
        createErr?.message ?? "Could not create user account",
      );
    }

    const supabaseUserId = created.user.id;

    try {
      const { organization, user } = await this.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: input.organizationName,
            slug,
            currency: "ETB",
          },
        });
        const user = await tx.user.create({
          data: {
            id: supabaseUserId,
            organizationId: organization.id,
            email: input.email,
            name: input.name,
            role: "OWNER",
          },
        });
        return { organization, user };
      });

      const session = await this.passwordLogin(input.email, input.password);
      return this.toAuthResponse({ user, organization, session });
    } catch (err) {
      // Rollback: delete the Supabase user so the customer can retry without
      // hitting "email already exists" forever.
      await this.supabase.admin.auth.admin.deleteUser(supabaseUserId).catch((e) => {
        this.logger.error(
          `Failed to delete orphan Supabase user ${supabaseUserId}: ${(e as Error).message}`,
        );
      });
      throw err;
    }
  }

  async login(input: LoginInput): Promise<SharedAuthResponse> {
    const session = await this.passwordLogin(input.email, input.password);

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      include: { organization: true },
    });
    if (!user) {
      // Supabase says the password is valid but we have no local profile.
      // This means signup was partially completed earlier. Force a re-register.
      throw new UnauthorizedException(
        "Your account is incomplete. Please register again.",
      );
    }

    return this.toAuthResponse({
      user,
      organization: user.organization,
      session,
    });
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { data, error } = await this.supabase.anon.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !data.session) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  async me(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!user) throw new UnauthorizedException("User not found");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
    };
  }

  // ---------------------- private helpers ----------------------

  private async passwordLogin(
    email: string,
    password: string,
  ): Promise<{
    userId: string;
    accessToken: string;
    refreshToken: string;
  }> {
    const { data, error } = await this.supabase.anon.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session || !data.user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return {
      userId: data.user.id,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 50) || "business";

    let candidate = base;
    let counter = 1;
    while (await this.prisma.organization.findUnique({ where: { slug: candidate } })) {
      counter += 1;
      candidate = `${base}-${counter}`;
    }
    return candidate;
  }

  private toAuthResponse(args: {
    user: { id: string; email: string; name: string; role: string };
    organization: { id: string; name: string };
    session: { accessToken: string; refreshToken: string };
  }): SharedAuthResponse {
    return {
      user: {
        id: args.user.id,
        email: args.user.email,
        name: args.user.name,
        role: args.user.role as AuthUser["role"],
        organizationId: args.organization.id,
        organizationName: args.organization.name,
      },
      tokens: {
        accessToken: args.session.accessToken,
        refreshToken: args.session.refreshToken,
      },
    };
  }
}
