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
  propertySchemas,
} from "./routes/properties";
import {
  register,
  login,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  authSchemas,
} from "./routes/auth";
import {
  createLead,
  getLeadsForOwner,
  getMyLeads,
  getLeadById,
  updateLeadStatus,
  leadSchemas,
} from "./routes/leads";
import { authenticateToken, requireOwnerOrAgency } from "./middleware/auth";
import { validate } from "./middleware/validate";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes

  // ── Authentification ────────────────────────────────────────────────────────
  app.post("/api/auth/register", validate(authSchemas.register), register);
  app.post("/api/auth/login", validate(authSchemas.login), login);
  app.post("/api/auth/refresh", validate(authSchemas.refresh), refreshToken);
  app.post("/api/auth/change-password", authenticateToken, validate(authSchemas.changePassword), changePassword);
  app.post("/api/auth/forgot-password", forgotPassword);
  app.post("/api/auth/reset-password", resetPassword);
  app.get("/api/auth/me", authenticateToken, getProfile);
  app.patch("/api/auth/profile", authenticateToken, validate(authSchemas.updateProfile), updateProfile);

  // ── Properties ──────────────────────────────────────────────────────────────
  app.get("/api/properties", getProperties);
  app.get("/api/properties/search", validate(propertySchemas.search), searchProperties);
  app.get("/api/properties/:id", validate(propertySchemas.byId), getPropertyById);
  app.post("/api/properties", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.create), createProperty);
  app.put("/api/properties/:id", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.byId), updateProperty);
  app.delete("/api/properties/:id", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.byId), deleteProperty);
  app.get("/api/properties/owner/:ownerId", getPropertiesByOwner);

  // ── Leads ───────────────────────────────────────────────────────────────────
  // Tenant: submit a lead request
  app.post("/api/leads", authenticateToken, validate(leadSchemas.create), createLead);
  // Tenant: see my own submitted leads
  app.get("/api/leads/mine", authenticateToken, getMyLeads);
  // Owner/Agency: see leads for their properties
  app.get("/api/leads", authenticateToken, requireOwnerOrAgency, getLeadsForOwner);
  // Single lead detail (owner or submitting tenant)
  app.get("/api/leads/:id", authenticateToken, getLeadById);
  // Owner: update lead status
  app.patch("/api/leads/:id/status", authenticateToken, requireOwnerOrAgency, validate(leadSchemas.updateStatus), updateLeadStatus);

  const httpServer = createServer(app);

  return httpServer;
}
