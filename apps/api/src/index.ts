import { buildApp } from "./app";
import { getConfig } from "./lib/config";

const app = await buildApp();

if (process.env.VERCEL !== "1") {
  const config = getConfig();
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

export default app;
