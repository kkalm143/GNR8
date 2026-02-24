import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Turbopack bundling Prisma/pg; prevents "reading 'modules' of undefined" on /dashboard
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcrypt"],
};

export default nextConfig;
