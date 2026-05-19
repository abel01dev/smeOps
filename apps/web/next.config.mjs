/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@sme/shared"],
  typedRoutes: false,
};

export default nextConfig;
