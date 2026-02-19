import type { Express } from "express";
import { createServer, type Server } from "node:http";
import {
  getProperties,
  searchProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertiesByOwner,
} from "./routes/properties";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  // Properties
  app.get("/api/properties", getProperties);
  app.get("/api/properties/search", searchProperties);
  app.get("/api/properties/:id", getPropertyById);
  app.post("/api/properties", createProperty);
  app.put("/api/properties/:id", updateProperty);
  app.delete("/api/properties/:id", deleteProperty);
  app.get("/api/properties/owner/:ownerId", getPropertiesByOwner);

  const httpServer = createServer(app);

  return httpServer;
}
