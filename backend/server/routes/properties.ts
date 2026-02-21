import { type Request, type Response } from "express";
import { z } from "zod";
import { propertyService } from "../services/propertyService";
import { asyncHandler } from "../utils/asyncHandler";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../utils/errors";

// Schemas de validation
const propertyIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de propriété invalide"),
  }),
});

const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
    type: z.enum(["Appartement", "Villa", "Studio", "Chambre", "Duplex", "Maison"]),
    commune: z.enum(["Ratoma", "Matam", "Kaloum", "Matoto", "Dixinn"]),
    quartier: z.string().min(2, "Le quartier est requis"),
    surfaceM2: z.number().positive().optional(),
    totalRooms: z.number().int().positive(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative().optional(),
    priceGNF: z.number().positive(),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    // ... autres champs optionnels peuvent être ajoutés ici au besoin
  }),
});

const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Le paramètre de recherche 'q' est requis"),
    limit: z.string().transform(Number).optional(),
  }),
});

// GET /api/properties - Lister les propriétés
export const getProperties = asyncHandler(async (req: Request, res: Response) => {
  const {
    commune,
    type,
    minPrice,
    maxPrice,
    bedrooms,
    furnished,
    waterReliable,
    electricityReliable,
    generatorIncluded,
    accessibleInRain,
    verifiedOnly,
    availableNow,
    q,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filters = {
    commune: commune ? (Array.isArray(commune) ? commune.map(String) : [String(commune)]) : undefined,
    type: type ? (Array.isArray(type) ? type.map(String) : [String(type)]) : undefined,
    minPrice: minPrice ? parseInt(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
    bedrooms: bedrooms ? parseInt(bedrooms as string) : undefined,
    furnished: furnished as string,
    waterReliable: waterReliable === 'true',
    electricityReliable: electricityReliable === 'true',
    generatorIncluded: generatorIncluded === 'true',
    accessibleInRain: accessibleInRain === 'true',
    verifiedOnly: verifiedOnly === 'true',
    availableNow: availableNow === 'true',
    q: q as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    sortBy: sortBy as 'createdAt' | 'priceGNF' | 'viewCount',
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  const properties = await propertyService.getProperties(filters);
  const total = await propertyService.countProperties(filters);

  res.json({
    success: true,
    data: properties,
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filters.limit < total,
    },
  });
});

// GET /api/properties/search - Rechercher des propriétés
export const searchProperties = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = '10' } = req.query;

  const properties = await propertyService.searchProperties(q as string, parseInt(limit as string));

  res.json({
    success: true,
    data: properties,
    query: q,
  });
});

// GET /api/properties/:id - Récupérer une propriété
export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const property = await propertyService.getPropertyById(id);

  if (!property) throw new NotFoundError("Propriété non trouvée");

  res.json({
    success: true,
    data: property,
  });
});

// POST /api/properties - Créer une propriété
export const createProperty = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const property = await propertyService.createProperty(userId, req.body);

  res.status(201).json({
    success: true,
    data: property,
    message: "Propriété créée avec succès",
  });
});

// PUT /api/properties/:id - Modifier une propriété
export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const { id } = req.params;
  const property = await propertyService.updateProperty(id, userId, req.body);

  res.json({
    success: true,
    data: property,
    message: "Propriété mise à jour avec succès",
  });
});

// DELETE /api/properties/:id - Supprimer une propriété
export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError();

  const { id } = req.params;
  await propertyService.deleteProperty(id, userId);

  res.json({
    success: true,
    message: "Propriété supprimée avec succès",
  });
});

// GET /api/properties/owner/:ownerId - Liste des propriétés pour un propriétaire
export const getPropertiesByOwner = asyncHandler(async (req: Request, res: Response) => {
  const { ownerId } = req.params;
  const properties = await propertyService.getPropertiesByOwner(ownerId);

  res.json({
    success: true,
    data: properties,
  });
});

export const propertySchemas = {
  create: createPropertySchema,
  byId: propertyIdSchema,
  search: searchSchema,
};
