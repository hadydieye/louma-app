import type { Express } from "express";
import { createServer, type Server } from "node:http";
import {
  getProperties,
  getPropertyById,
  createProperty,
  searchProperties,
  updateProperty,
  deleteProperty,
  getPropertiesByOwner,
  addPropertyImage,
  deletePropertyImage,
  setMainImage,
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
  updatePushToken,
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
import { propertyUpload, avatarUpload } from "./services/uploadService";
import type { Request, Response } from "express";

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
  app.patch("/api/auth/push-token", authenticateToken, validate(authSchemas.pushToken), updatePushToken);

  // ── Properties ──────────────────────────────────────────────────────────────
  app.get("/api/properties", getProperties);
  app.get("/api/properties/search", validate(propertySchemas.search), searchProperties);
  app.get("/api/properties/:id", validate(propertySchemas.byId), getPropertyById as any);
  app.post("/api/properties", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.create), createProperty);
  app.put("/api/properties/:id", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.byId), updateProperty);
  app.delete("/api/properties/:id", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.byId), deleteProperty);
  app.get("/api/properties/owner/:ownerId", getPropertiesByOwner);

  // Images des propriétés
  app.post("/api/properties/:id/images", authenticateToken, requireOwnerOrAgency, validate(propertySchemas.addImage), addPropertyImage);
  app.delete("/api/properties/:id/images/:imageId", authenticateToken, requireOwnerOrAgency, deletePropertyImage);
  app.patch("/api/properties/:id/images/:imageId/main", authenticateToken, requireOwnerOrAgency, setMainImage);

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

  // ── Upload ──────────────────────────────────────────────────────────────────
  app.post("/api/upload", authenticateToken, propertyUpload.single("image"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ imageUrl: (req.file as any).path });
  });

  app.post("/api/upload/avatar", authenticateToken, avatarUpload.single("image"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({ imageUrl: (req.file as any).path });
  });

  const httpServer = createServer(app);

  return httpServer;
}
