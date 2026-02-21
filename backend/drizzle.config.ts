import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const schemaPath = path.resolve(__dirname, "../shared/schema.ts");

export default defineConfig({
  out: "./migrations",
  schema: schemaPath,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
