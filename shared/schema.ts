import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  uuid,
  pgEnum,
  index,
  primaryKey,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums pour les types spécifiques à la Guinée
export const propertyTypeEnum = pgEnum("property_type", [
  "Appartement", 
  "Villa", 
  "Studio", 
  "Chambre", 
  "Duplex", 
  "Maison"
]);

export const communeEnum = pgEnum("commune", [
  "Ratoma", 
  "Matam", 
  "Kaloum", 
  "Matoto", 
  "Dixinn"
]);

export const furnishedEnum = pgEnum("furnished_type", [
  "Meublé", 
  "Semi-meublé", 
  "Vide"
]);

export const waterSupplyEnum = pgEnum("water_supply", [
  "SEEG fiable", 
  "SEEG intermittente", 
  "Puits", 
  "Citerne"
]);

export const electricityTypeEnum = pgEnum("electricity_type", [
  "EDG fiable", 
  "EDG intermittente", 
  "Groupe seul", 
  "Solaire"
]);

export const currencyEnum = pgEnum("currency", ["GNF", "USD"]);
export const userRoleEnum = pgEnum("user_role", ["TENANT", "OWNER", "AGENCY"]);
export const propertyConditionEnum = pgEnum("property_condition", ["Neuf", "Bon état", "À rénover"]);

// Table des utilisateurs
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 500 }),
  role: userRoleEnum("role").notNull().default("TENANT"),
  commune: communeEnum("commune"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  budgetCurrency: currencyEnum("budget_currency").default("GNF"),
  profession: varchar("profession", { length: 255 }),
  householdSize: integer("household_size"),
  completionPercent: integer("completion_percent").default(0),
  isVerified: boolean("is_verified").default(false),
  verificationDocuments: text("verification_documents").array(), // URLs des documents
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index("users_phone_idx").on(table.phone),
  emailIdx: index("users_email_idx").on(table.email),
  communeIdx: index("users_commune_idx").on(table.commune),
}));

// Table des propriétés
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  type: propertyTypeEnum("type").notNull(),
  commune: communeEnum("commune").notNull(),
  quartier: varchar("quartier", { length: 255 }).notNull(),
  repere: varchar("repere", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  surfaceM2: decimal("surface_m2", { precision: 8, scale: 2 }),
  totalRooms: integer("total_rooms").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  floor: integer("floor"),
  furnished: furnishedEnum("furnished").notNull(),
  condition: propertyConditionEnum("condition").notNull(),
  waterSupply: waterSupplyEnum("water_supply").notNull(),
  electricityType: electricityTypeEnum("electricity_type").notNull(),
  hasGenerator: boolean("has_generator").notNull().default(false),
  generatorIncluded: boolean("generator_included").notNull().default(false),
  hasAC: boolean("has_ac").notNull().default(false),
  acCount: integer("ac_count"),
  hasParking: boolean("has_parking").notNull().default(false),
  hasSecurity: boolean("has_security").notNull().default(false),
  hasInternet: boolean("has_internet").notNull().default(false),
  hasHotWater: boolean("has_hot_water").notNull().default(false),
  accessibleInRain: boolean("accessible_in_rain").notNull().default(false),
  priceGNF: decimal("price_gnf", { precision: 12, scale: 2 }).notNull(),
  priceUSD: decimal("price_usd", { precision: 12, scale: 2 }),
  preferredCurrency: currencyEnum("preferred_currency").notNull().default("GNF"),
  chargesIncluded: boolean("charges_included").notNull().default(false),
  depositMonths: integer("deposit_months").notNull().default(1),
  advanceMonths: integer("advance_months").notNull().default(1),
  negotiable: boolean("negotiable").notNull().default(false),
  petsAllowed: boolean("pets_allowed").notNull().default(true),
  smokingAllowed: boolean("smoking_allowed").notNull().default(false),
  maxOccupants: integer("max_occupants"),
  availableFrom: timestamp("available_from").notNull(),
  minDurationMonths: integer("min_duration_months").notNull().default(6),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationDocuments: text("verification_documents").array(), // URLs des documents
  description: text("description").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  leadCount: integer("lead_count").notNull().default(0),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").notNull().default(true),
  isAvailable: boolean("is_available").notNull().default(true),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("properties_title_idx").on(table.title),
  communeIdx: index("properties_commune_idx").on(table.commune),
  typeIdx: index("properties_type_idx").on(table.type),
  priceIdx: index("properties_price_idx").on(table.priceGNF),
  ownerIdx: index("properties_owner_idx").on(table.ownerId),
  availableIdx: index("properties_available_idx").on(table.isAvailable),
  verifiedIdx: index("properties_verified_idx").on(table.isVerified),
}));

// Table des images des propriétés
export const propertyImages = pgTable("property_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 255 }),
  order: integer("order").notNull().default(0),
  isMain: boolean("is_main").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index("property_images_property_idx").on(table.propertyId),
  orderIdx: index("property_images_order_idx").on(table.propertyId, table.order),
}));

// Table des favoris
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userPropertyIdx: uniqueIndex("favorites_user_property_idx").on(table.userId, table.propertyId),
  userIdx: index("favorites_user_idx").on(table.userId),
  propertyIdx: index("favorites_property_idx").on(table.propertyId),
}));

// Table des leads (contacts pour les propriétés)
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("NEW"), // NEW, CONTACTED, VISITED, CLOSED
  level: varchar("level", { length: 20 }).notNull().default("COLD"), // COLD, WARM, HOT, VERIFIED
  contactDate: timestamp("contact_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index("leads_property_idx").on(table.propertyId),
  userIdx: index("leads_user_idx").on(table.userId),
  statusIdx: index("leads_status_idx").on(table.status),
}));

// Table des visites
export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(30), // minutes
  status: varchar("status", { length: 20 }).notNull().default("SCHEDULED"), // SCHEDULED, COMPLETED, CANCELLED
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index("visits_property_idx").on(table.propertyId),
  leadIdx: index("visits_lead_idx").on(table.leadId),
  dateIdx: index("visits_date_idx").on(table.scheduledDate),
}));

// Table des reviews/avis
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  response: text("response"), // Réponse du propriétaire
  isVerified: boolean("is_verified").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  propertyIdx: index("reviews_property_idx").on(table.propertyId),
  reviewerIdx: index("reviews_reviewer_idx").on(table.reviewerId),
  ratingIdx: index("reviews_rating_idx").on(table.rating),
}));

// Zod Schemas pour validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
  isVerified: true,
  verificationDocuments: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  leadCount: true,
  publishedAt: true,
});

export const insertPropertyImageSchema = createInsertSchema(propertyImages).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  helpfulCount: true,
  isVerified: true,
});

// Types exportés
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = z.infer<typeof insertPropertyImageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Types pour les enums
export type PropertyType = typeof propertyTypeEnum.enumValues[number];
export type Commune = typeof communeEnum.enumValues[number];
export type FurnishedType = typeof furnishedEnum.enumValues[number];
export type WaterSupply = typeof waterSupplyEnum.enumValues[number];
export type ElectricityType = typeof electricityTypeEnum.enumValues[number];
export type Currency = typeof currencyEnum.enumValues[number];
export type UserRole = typeof userRoleEnum.enumValues[number];
export type PropertyCondition = typeof propertyConditionEnum.enumValues[number];
