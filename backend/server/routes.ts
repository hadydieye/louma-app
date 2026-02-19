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
import {
  register,
  login,
  refreshToken,
  changePassword,
  requestPasswordReset,
  resetPassword,
  getProfile,
} from "./routes/auth";
import { authenticateToken } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Authentification
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/refresh", refreshToken);
  app.post("/api/auth/change-password", authenticateToken, changePassword);
  app.post("/api/auth/request-password-reset", requestPasswordReset);
  app.post("/api/auth/reset-password", resetPassword);
  app.get("/api/auth/me", authenticateToken, getProfile);

  // Properties
  app.get("/api/properties", getProperties);
  app.get("/api/properties/search", searchProperties);
  app.get("/api/properties/:id", getPropertyById);
  app.post("/api/properties", authenticateToken, createProperty);
  app.put("/api/properties/:id", authenticateToken, updateProperty);
  app.delete("/api/properties/:id", authenticateToken, deleteProperty);
  app.get("/api/properties/owner/:ownerId", getPropertiesByOwner);

  const httpServer = createServer(app);

  return httpServer;
}
