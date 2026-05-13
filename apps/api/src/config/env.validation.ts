import { z } from "zod";

/**
 * Runtime validation of environment variables at startup.
 * Fail-fast: if anything required is missing or malformed, the app will not
 * boot — much better than discovering a missing key on the 200th request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),

  // ----- Database -----
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // ----- Supabase -----
  // SUPABASE_URL: public REST + Auth endpoint for the project
  SUPABASE_URL: z.string().url(),
  // SUPABASE_ANON_KEY: safe to expose to browsers (RLS protects data).
  // Accepts either the new "sb_publishable_*" format or the legacy JWT-shaped key.
  SUPABASE_ANON_KEY: z.string().min(20),
  // SUPABASE_SERVICE_ROLE_KEY: bypasses RLS — backend only, NEVER ship to browser.
  // Accepts either "sb_secret_*" or the legacy service_role JWT.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function envValidation(raw: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
