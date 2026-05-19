import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@prisma/client";
import type { Request } from "express";

import type { RequestUser } from "../decorators/current-user.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException("Authentication required");
    }
    if (!required.includes(user.role)) {
      throw new ForbiddenException(
        `This action requires one of: ${required.join(", ")}`,
      );
    }
    return true;
  }
}
