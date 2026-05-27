import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const vercelRoot = process.cwd();
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(repoRoot, "apps/dashboard/.next");
const destination = join(vercelRoot, ".next");

const build = spawnSync("pnpm", ["--filter", "@dummy-api/dashboard", "build"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
  shell: true
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

if (!existsSync(source)) {
  console.error(`Expected Next.js build output at ${source}`);
  process.exit(1);
}

if (source !== destination) {
  rmSync(destination, { recursive: true, force: true });
  cpSync(source, destination, { recursive: true });
}

const routesManifest = join(destination, "routes-manifest.json");

if (!existsSync(routesManifest)) {
  console.error(`Missing routes-manifest.json in ${destination}`);
  process.exit(1);
}

console.log(source === destination ? `Next.js output already at ${destination}` : `Synced Next.js output from ${source} to ${destination}`);
