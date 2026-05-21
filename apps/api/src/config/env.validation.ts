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

  /** 32+ char secret for encrypting per-user OpenRouter API keys at rest. */
  AI_ENCRYPTION_KEY: z.string().min(32).optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

const PLACEHOLDER_HINT =
  "\n\nCopy apps/api/.env.example → apps/api/.env and replace PROJECT_REF, [YOUR-PASSWORD], and Supabase API keys with values from your Supabase dashboard.\nRun: pnpm --filter @sme/api check:env";

function assertNotPlaceholder(key: string, value: string): void {
  if (
    /PROJECT_REF/i.test(value) ||
    /\[YOUR-PASSWORD\]/i.test(value) ||
    /sb_publishable_\.\.\./i.test(value) ||
    /sb_secret_\.\.\./i.test(value)
  ) {
    throw new Error(
      `Invalid environment configuration:\n  - ${key}: still contains example placeholder values.${PLACEHOLDER_HINT}`,
    );
  }
}

export function envValidation(raw: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}${PLACEHOLDER_HINT}`,
    );
  }

  const data = parsed.data;
  assertNotPlaceholder("DATABASE_URL", data.DATABASE_URL);
  assertNotPlaceholder("SUPABASE_URL", data.SUPABASE_URL);
  assertNotPlaceholder("SUPABASE_ANON_KEY", data.SUPABASE_ANON_KEY);
  assertNotPlaceholder(
    "SUPABASE_SERVICE_ROLE_KEY",
    data.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (data.DIRECT_URL) assertNotPlaceholder("DIRECT_URL", data.DIRECT_URL);

  return data;
}
