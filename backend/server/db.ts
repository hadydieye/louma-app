import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../shared/schema";
import { config } from "./config";

// Parsing manuel de la DATABASE_URL pour extraire les composants (évite les problèmes d'encodage URI)
const dbConfig = new URL(config.database.url);
const client = postgres({
  host: dbConfig.hostname,
  port: parseInt(dbConfig.port || '5432'),
  database: dbConfig.pathname.split('/')[1],
  username: dbConfig.username,
  password: decodeURIComponent(dbConfig.password), // On décode explicitement ici
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => { },
});

// Instance Drizzle ORM
export const db = drizzle(client, {
  schema,
  logger: config.server.nodeEnv === "development"
});

// Export du schema pour utilisation dans les routes
export { schema };

// Helper pour les transactions
export async function transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
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
