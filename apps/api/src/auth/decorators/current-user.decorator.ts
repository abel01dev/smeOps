import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import type { Request } from "express";

/**
 * The shape the SupabaseAuthGuard attaches to `req.user` after a successful
 * token verification + DB lookup.
 */
export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "MANAGER" | "CASHIER";
  organizationId: string;
}

/**
 * Inject the authenticated user into a controller method.
 *
 * Usage:
 *   @Get('me')
 *   getMe(@CurrentUser() user: RequestUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    if (!req.user) {
      throw new InternalServerErrorException(
        "CurrentUser used on a route with no auth guard — add @UseGuards or remove @Public",
      );
    }
    return req.user;
  },
);

/**
 * Shortcut: inject just the user's organizationId.
 * Convenient because almost every feature service needs this and only this.
 */
export const OrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    if (!req.user) {
      throw new InternalServerErrorException(
        "OrganizationId used on a route with no auth guard",
      );
    }
    return req.user.organizationId;
  },
);
