/**
 * Validates apps/api/.env before migrate/seed/dev.
 * Run: pnpm --filter @sme/api check:env
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(__dirname, "../.env");

const PLACEHOLDER_PATTERNS = [
  /PROJECT_REF/i,
  /\[YOUR-PASSWORD\]/i,
  /sb_publishable_\.\.\./i,
  /sb_secret_\.\.\./i,
  /YOUR-PASSWORD/,
];

function loadEnvFile(path: string): Record<string, string> {
  const raw = readFileSync(path, "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function main(): void {
  if (!existsSync(ENV_PATH)) {
    console.error(
      "\n❌ Missing apps/api/.env\n\n   cp apps/api/.env.example apps/api/.env\n   Then fill in your Supabase credentials (see apps/api/.env.example comments).\n",
    );
    process.exit(1);
  }

  const env = loadEnvFile(ENV_PATH);
  const errors: string[] = [];

  const required = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ] as const;

  for (const key of required) {
    const value = env[key];
    if (!value) {
      errors.push(`${key} is not set`);
      continue;
    }
    if (PLACEHOLDER_PATTERNS.some((p) => p.test(value))) {
      errors.push(`${key} still contains example placeholder text`);
    }
    if (key.includes("KEY") && value.length < 20) {
      errors.push(
        `${key} is too short (${value.length} chars) — paste the full key from Supabase → Project Settings → API`,
      );
    }
  }

  if (errors.length) {
    console.error("\n❌ apps/api/.env is not configured for local development:\n");
    for (const e of errors) {
      console.error(`   • ${e}`);
    }
    console.error(`
Fix:
  1. Open https://supabase.com/dashboard → your project
  2. Settings → Database → copy the connection string (replace [YOUR-PASSWORD])
  3. Settings → API → copy Project URL, anon key, and service_role key
  4. Paste into apps/api/.env (DATABASE_URL, DIRECT_URL, SUPABASE_*)

Then run: pnpm db:migrate && pnpm db:seed && pnpm dev:api
`);
    process.exit(1);
  }

  console.log("✅ apps/api/.env looks configured.");
}

main();
