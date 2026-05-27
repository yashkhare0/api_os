import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(repoRoot, "apps/dashboard/.next");
const destination = join(process.cwd(), ".next");

if (!existsSync(source)) {
  console.error(`Expected Next.js build output at ${source}`);
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });

const routesManifest = join(destination, "routes-manifest.json");

if (!existsSync(routesManifest)) {
  console.error(`Missing routes-manifest.json in ${destination}`);
  process.exit(1);
}

console.log(`Synced Next.js output from ${source} to ${destination}`);
