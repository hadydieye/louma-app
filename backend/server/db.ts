import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../shared/schema";

// Configuration de la connexion à la base de données
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Client PostgreSQL avec configuration optimisée
const client = postgres(connectionString, {
  prepare: false,
  max: 10, // Maximum de connexions
  idle_timeout: 20,
  connect_timeout: 10,
});

// Instance Drizzle ORM
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === "development" 
});

// Export du schema pour utilisation dans les routes
export { schema };

// Helper pour les transactions
export async function transaction<T>(callback: (tx: typeof db) => Promise<T>): Promise<T> {
  return db.transaction(callback);
}

// Helper pour vérifier la connexion
export async function checkConnection(): Promise<boolean> {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}

// Export du client pour fermeture propre
export { client };
