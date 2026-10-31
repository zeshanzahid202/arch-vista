// Isolated, ephemeral test server. Never points at the operator's database.
import { createTestDatabase } from "./test-database";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
const mongo = await createTestDatabase();
const env = {
  ...process.env,
  MONGODB_URI: mongo.getUri("archvista_e2e"),
  AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  AUTH_SECRET: randomBytes(32).toString("base64url"),
  ADMIN_EMAIL: "browser-test@example.com",
  ADMIN_NAME: "Browser Test Owner",
  ADMIN_PASSWORD: "only-for-isolated-browser-tests",
  SMTP_HOST: "",
  CLOUDINARY_API_SECRET: "",
};
for (const script of ["scripts/seed.ts", "scripts/create-admin.ts"]) {
  const result = spawnSync(process.execPath, ["--import", "tsx", script], {
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    await mongo.stop();
    process.exit(1);
  }
}
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev"],
  { env, stdio: "inherit" },
);
async function stop() {
  server.kill();
  await mongo.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
server.on("exit", async (code) => {
  await mongo.stop();
  process.exit(code || 0);
});
