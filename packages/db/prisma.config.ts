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
//
// Monorepo झाल्यापासून हे package `packages/db` मध्ये आहे पण `.env` repo च्या मुळाशीच
// आहे (एकच file, तिन्ही apps साठी). म्हणून आधी वरचा प्रयत्न, मग स्थानिक — दोन्ही
// अयशस्वी झाले तर environment आधीच भरलेलं आहे असं गृहीत धरायचं.
for (const candidate of [path.join(__dirname, "..", "..", ".env"), ".env"]) {
  try {
    process.loadEnvFile(candidate);
    break;
  } catch {
    // पुढचा प्रयत्न.
  }
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
