import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    "/*": ["../api/public/assets/**/*"]
  },
  transpilePackages: ["@dummy-api/api", "@dummy-api/catalog", "@dummy-api/contracts", "@dummy-api/core"],
  turbopack: {
    root: repoRoot
  }
};

export default nextConfig;
