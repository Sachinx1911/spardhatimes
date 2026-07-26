import path from "node:path";
import { defineConfig } from "prisma/config";

// Replaces the `prisma` block that used to live in package.json — that form is
// deprecated and removed in Prisma 7. The seed command moves under `migrations`.
//
// Declaring a config file also switches OFF Prisma's automatic .env loading
// ("Prisma config detected, skipping environment variable loading"), so the
// datasource env vars have to be loaded here or every CLI command fails with
// "Environment variable not found: DATABASE_URL".
//
// Guarded: there is no .env file on Vercel — the platform injects the variables
// directly, and loadEnvFile throws when the file is absent.
try {
  process.loadEnvFile();
} catch {
  // No .env on disk; assume the environment is already populated.
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
