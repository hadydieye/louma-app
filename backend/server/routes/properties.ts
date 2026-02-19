import { type Request, type Response } from "express";
import { propertyService } from "../services/propertyService";
import { insertPropertySchema } from "../../../shared/schema";

// GET /api/properties - Lister les propriétés
export async function getProperties(req: Request, res: Response) {
  try {
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
  } catch (error) {
    console.error("Error getting properties:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des propriétés",
    });
  }
}

// GET /api/properties/search - Rechercher des propriétés
export async function searchProperties(req: Request, res: Response) {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: "Le paramètre de recherche 'q' est requis",
      });
    }

    const searchQuery = Array.isArray(q) ? q[0] : q;
    const properties = await propertyService.searchProperties(searchQuery, parseInt(limit as string));

    res.json({
      success: true,
      data: properties,
      query: q,
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche des propriétés",
    });
  }
}

// GET /api/properties/:id - Récupérer une propriété
export async function getPropertyById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "L'ID de la propriété est requis",
      });
    }

    const property = await propertyService.getPropertyById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Propriété non trouvée",
      });
    }

    // Incrémenter le compteur de vues
    await propertyService.incrementViewCount(propertyId);

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error getting property:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la propriété",
    });
  }
}

// POST /api/properties - Créer une propriété
export async function createProperty(req: Request, res: Response) {
  try {
    // TODO: Ajouter authentification middleware
    // const userId = req.user?.id;
    const userId = "temp-user-id"; // Temporaire

    const validatedData = insertPropertySchema.parse(req.body);
    
    const property = await propertyService.createProperty(validatedData, userId);

    res.status(201).json({
      success: true,
      data: property,
      message: "Propriété créée avec succès",
    });
  } catch (error) {
    console.error("Error creating property:", error);
    
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: (error as any).errors,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la propriété",
    });
  }
}

// PUT /api/properties/:id - Mettre à jour une propriété
export async function updateProperty(req: Request, res: Response) {
  try {
    // TODO: Ajouter authentification middleware
    // const userId = req.user?.id;
    const userId = "temp-user-id"; // Temporaire

    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "L'ID de la propriété est requis",
      });
    }

    const validatedData = insertPropertySchema.partial().parse(req.body);
    
    const property = await propertyService.updateProperty(propertyId, validatedData, userId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Propriété non trouvée ou non autorisée",
      });
    }

    res.json({
      success: true,
      data: property,
      message: "Propriété mise à jour avec succès",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: (error as any).errors,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la propriété",
    });
  }
}

// DELETE /api/properties/:id - Supprimer une propriété
export async function deleteProperty(req: Request, res: Response) {
  try {
    // TODO: Ajouter authentification middleware
    // const userId = req.user?.id;
    const userId = "temp-user-id"; // Temporaire

    const { id } = req.params;
    const propertyId = Array.isArray(id) ? id[0] : id;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "L'ID de la propriété est requis",
      });
    }

    const success = await propertyService.deleteProperty(propertyId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Propriété non trouvée ou non autorisée",
      });
    }

    res.json({
      success: true,
      message: "Propriété supprimée avec succès",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la propriété",
    });
  }
}

// GET /api/properties/owner/:ownerId - Récupérer les propriétés d'un propriétaire
export async function getPropertiesByOwner(req: Request, res: Response) {
  try {
    const { ownerId } = req.params;
    const owner = Array.isArray(ownerId) ? ownerId[0] : ownerId;
    const { limit = 20, offset = 0 } = req.query;

    if (!owner) {
      return res.status(400).json({
        success: false,
        message: "L'ID du propriétaire est requis",
      });
    }

    const properties = await propertyService.getPropertiesByOwner(
      owner,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Error getting properties by owner:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des propriétés du propriétaire",
    });
  }
}
