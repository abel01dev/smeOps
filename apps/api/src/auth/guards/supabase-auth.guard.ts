import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

import { PrismaService } from "../../prisma/prisma.service";
import type { RequestUser } from "../decorators/current-user.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * Global authentication guard.
 *
 * Verifies Supabase access tokens using JWKS (the project's public keys are
 * fetched + cached automatically from `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`).
 * This supports the modern asymmetric signing keys Supabase uses by default
 * (ES256 / RS256) — no shared secret needed.
 *
 * Flow per request:
 *   1. Skip if the route is marked @Public().
 *   2. Extract `Authorization: Bearer <token>`.
 *   3. Verify signature + issuer + expiry against JWKS.
 *   4. Look up the user in our DB (their id matches the token's `sub`).
 *   5. Attach `req.user` so downstream code can use @CurrentUser().
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private jwks!: ReturnType<typeof createRemoteJWKSet>;
  private issuer!: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const supabaseUrl = this.config.getOrThrow<string>("SUPABASE_URL");
    this.issuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/.well-known/jwks.json`),
      { cooldownDuration: 30_000, cacheMaxAge: 600_000 },
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException("Missing or malformed Authorization header");
    }

    let payload: JWTPayload;
    try {
      const verified = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
      });
      payload = verified.payload;
    } catch (err) {
      this.logger.debug(`JWT verify failed: ${(err as Error).message}`);
      throw new UnauthorizedException("Invalid or expired token");
    }

    const supabaseUserId = payload.sub;
    if (!supabaseUserId || typeof supabaseUserId !== "string") {
      throw new UnauthorizedException("Token has no subject");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: supabaseUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException("User profile not found");
    }

    req.user = user;
    return true;
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return null;
    const token = header.slice(7).trim();
    return token.length > 0 ? token : null;
  }
}
