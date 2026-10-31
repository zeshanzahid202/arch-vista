import { MongoMemoryServer } from "mongodb-memory-server";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp } from "node:fs/promises";
import { resolve, sep } from "node:path";
/** Keep all test database writes inside the checkout, never the operator's DB. */
export async function createTestDatabase() {
  const root = resolve(".local/test-databases");
  await mkdir(root, { recursive: true });
  const dbPath = await mkdtemp(resolve(root, "instance-"));
  if (!dbPath.startsWith(`${root}${sep}`))
    throw new Error("Invalid test database path");
  const local = resolve(".local/mongodb/mongod.exe");
  return MongoMemoryServer.create({
    instance: { dbPath, args: ["--wiredTigerCacheSizeGB", "0.25"] },
    binary: existsSync(local) ? { systemBinary: local } : undefined,
  });
}
