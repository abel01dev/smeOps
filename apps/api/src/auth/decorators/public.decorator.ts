import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/**
 * Mark a route as publicly accessible (skips the global SupabaseAuthGuard).
 * Use sparingly — only for auth endpoints and health checks.
 *
 * Usage:
 *   @Public()
 *   @Post('login')
 *   login(...) {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
