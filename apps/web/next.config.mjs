import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Monorepo root — avoids Turbopack picking a parent folder lockfile (e.g. user home).
const monorepoRoot = path.join(__dirname, "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sme/shared"],
  typedRoutes: false,
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
