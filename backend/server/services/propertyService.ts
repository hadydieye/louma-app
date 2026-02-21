import { eq, and, desc, asc, ilike, inArray, gte, lte, isNull, sql } from "drizzle-orm";
import { db } from "../db";
import { properties, propertyImages, users, type Property, type InsertProperty } from "../../../shared/schema";

export interface PropertyFilters {
  commune?: string[];
  type?: string[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  furnished?: string;
  waterReliable?: boolean;
  electricityReliable?: boolean;
  generatorIncluded?: boolean;
  accessibleInRain?: boolean;
  verifiedOnly?: boolean;
  availableNow?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'priceGNF' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyWithImages extends Property {
  images: Array<{
    id: string;
    imageUrl: string;
    alt: string | null;
    order: number;
    isMain: boolean;
  }>;
  owner: {
    id: string;
    fullName: string;
    phone: string;
    avatar: string | null;
  };
}

class PropertyService {
  // Créer une nouvelle propriété
  async createProperty(data: InsertProperty, ownerId: string): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ...data,
        ownerId,
        publishedAt: new Date(),
      })
      .returning();

    return property;
  }

  // Récupérer une propriété par ID avec images et propriétaire
  async getPropertyById(id: string): Promise<PropertyWithImages | null> {
    const property = await db
      .select({
        ...properties,
        images: propertyImages,
        owner: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
        },
      })
      .from(properties)
      .leftJoin(propertyImages, eq(properties.id, propertyImages.propertyId))
      .leftJoin(users, eq(properties.ownerId, users.id))
      .where(eq(properties.id, id))
      .limit(1);

    if (!property || property.length === 0) {
      return null;
    }

    // Organiser les données
    const result = property[0];
    return {
      ...result,
      images: property
        .filter(p => p.propertyImages)
        .map(p => ({
          id: p.propertyImages!.id,
          imageUrl: p.propertyImages!.imageUrl,
          alt: p.propertyImages!.alt,
          order: p.propertyImages!.order,
          isMain: p.propertyImages!.isMain,
        }))
        .sort((a, b) => a.order - b.order),
      owner: result.owner!,
    };
  }

  // Lister les propriétés avec filtres
  async getProperties(filters: PropertyFilters = {}): Promise<PropertyWithImages[]> {
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
    } = filters;

    // Construire les conditions WHERE
    const conditions = [
      eq(properties.isActive, true),
      eq(properties.isAvailable, true),
    ];

    if (commune && commune.length > 0) {
      conditions.push(inArray(properties.commune, commune as any[]));
    }

    if (type && type.length > 0) {
      conditions.push(inArray(properties.type, type as any[]));
    }

    if (minPrice) {
      conditions.push(gte(properties.priceGNF, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(properties.priceGNF, maxPrice));
    }

    if (bedrooms) {
      conditions.push(eq(properties.bedrooms, bedrooms));
    }

    if (furnished) {
      conditions.push(eq(properties.furnished, furnished as any));
    }

    if (waterReliable) {
      conditions.push(
        inArray(properties.waterSupply, ['SEEG fiable', 'Puits', 'Citerne'] as any[])
      );
    }

    if (electricityReliable) {
      conditions.push(
        inArray(properties.electricityType, ['EDG fiable', 'Groupe seul', 'Solaire'] as any[])
      );
    }

    if (generatorIncluded) {
      conditions.push(eq(properties.generatorIncluded, true));
    }

    if (accessibleInRain) {
      conditions.push(eq(properties.accessibleInRain, true));
    }

    if (verifiedOnly) {
      conditions.push(eq(properties.isVerified, true));
    }

    if (availableNow) {
      conditions.push(lte(properties.availableFrom, new Date()));
    }

    if (q) {
      conditions.push(
        sql`(${properties.title} ILIKE ${`%${q}%`} OR ${properties.quartier} ILIKE ${`%${q}%`} OR ${properties.description} ILIKE ${`%${q}%`})`
      );
    }

    // Ordre de tri
    const orderField = properties[sortBy as keyof typeof properties];
    const orderDirection = sortOrder === 'asc' ? asc : desc;

    const results = await db
      .select({
        ...properties,
        images: propertyImages,
        owner: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
        },
      })
      .from(properties)
      .leftJoin(propertyImages, eq(properties.id, propertyImages.propertyId))
      .leftJoin(users, eq(properties.ownerId, users.id))
      .where(and(...conditions))
      .orderBy(orderDirection(orderField!))
      .limit(limit)
      .offset(offset);

    // Organiser les résultats
    const propertyMap = new Map<string, PropertyWithImages>();

    results.forEach((row) => {
      const propertyId = row.id;

      if (!propertyMap.has(propertyId)) {
        propertyMap.set(propertyId, {
          ...row,
          images: [],
          owner: row.owner!,
        });
      }

      if (row.propertyImages) {
        const property = propertyMap.get(propertyId)!;
        property.images.push({
          id: row.propertyImages.id,
          imageUrl: row.propertyImages.imageUrl,
          alt: row.propertyImages.alt,
          order: row.propertyImages.order,
          isMain: row.propertyImages.isMain,
        });
      }
    });

    // Trier les images pour chaque propriété
    propertyMap.forEach((property) => {
      property.images.sort((a, b) => a.order - b.order);
    });

    return Array.from(propertyMap.values());
  }

  // Mettre à jour une propriété
  async updateProperty(id: string, data: Partial<InsertProperty>, ownerId: string): Promise<Property | null> {
    const [property] = await db
      .update(properties)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)))
      .returning();

    return property || null;
  }

  // Supprimer une propriété
  async deleteProperty(id: string, ownerId: string): Promise<boolean> {
    const result = await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)))
      .returning({ id: properties.id });

    return result.length > 0;
  }

  // Incrémenter le compteur de vues
  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(properties)
      .set({ viewCount: sql`${properties.viewCount} + 1` })
      .where(eq(properties.id, id));
  }

  // Rechercher des propriétés par texte
  async searchProperties(query: string, limit: number = 10): Promise<PropertyWithImages[]> {
    const results = await db
      .select({
        ...properties,
        images: propertyImages,
        owner: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
        },
      })
      .from(properties)
      .leftJoin(propertyImages, eq(properties.id, propertyImages.propertyId))
      .leftJoin(users, eq(properties.ownerId, users.id))
      .where(
        and(
          eq(properties.isActive, true),
          eq(properties.isAvailable, true),
          ilike(properties.title, `%${query}%`)
        )
      )
      .limit(limit);

    // Organiser les résultats comme dans getProperties
    const propertyMap = new Map<string, PropertyWithImages>();

    results.forEach((row) => {
      const propertyId = row.id;

      if (!propertyMap.has(propertyId)) {
        propertyMap.set(propertyId, {
          ...row,
          images: [],
          owner: row.owner!,
        });
      }

      if (row.propertyImages) {
        const property = propertyMap.get(propertyId)!;
        property.images.push({
          id: row.propertyImages.id,
          imageUrl: row.propertyImages.imageUrl,
          alt: row.propertyImages.alt,
          order: row.propertyImages.order,
          isMain: row.propertyImages.isMain,
        });
      }
    });

    propertyMap.forEach((property) => {
      property.images.sort((a, b) => a.order - b.order);
    });

    return Array.from(propertyMap.values());
  }

  // Compter le nombre de propriétés avec filtres
  async countProperties(filters: PropertyFilters = {}): Promise<number> {
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
    } = filters;

    const conditions = [
      eq(properties.isActive, true),
      eq(properties.isAvailable, true),
    ];

    if (commune && commune.length > 0) {
      conditions.push(inArray(properties.commune, commune as any[]));
    }

    if (type && type.length > 0) {
      conditions.push(inArray(properties.type, type as any[]));
    }

    if (minPrice) {
      conditions.push(gte(properties.priceGNF, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(properties.priceGNF, maxPrice));
    }

    if (bedrooms) {
      conditions.push(eq(properties.bedrooms, bedrooms));
    }

    if (furnished) {
      conditions.push(eq(properties.furnished, furnished as any));
    }

    if (waterReliable) {
      conditions.push(
        inArray(properties.waterSupply, ['SEEG fiable', 'Puits', 'Citerne'] as any[])
      );
    }

    if (electricityReliable) {
      conditions.push(
        inArray(properties.electricityType, ['EDG fiable', 'Groupe seul', 'Solaire'] as any[])
      );
    }

    if (generatorIncluded) {
      conditions.push(eq(properties.generatorIncluded, true));
    }

    if (accessibleInRain) {
      conditions.push(eq(properties.accessibleInRain, true));
    }

    if (verifiedOnly) {
      conditions.push(eq(properties.isVerified, true));
    }

    if (availableNow) {
      conditions.push(lte(properties.availableFrom, new Date()));
    }

    if (q) {
      conditions.push(
        sql`(${properties.title} ILIKE ${`%${q}%`} OR ${properties.quartier} ILIKE ${`%${q}%`} OR ${properties.description} ILIKE ${`%${q}%`})`
      );
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(and(...conditions))
      .limit(1);

    return result[0]?.count || 0;
  }

  // Récupérer les propriétés d'un propriétaire
  async getPropertiesByOwner(ownerId: string, limit: number = 20, offset: number = 0): Promise<PropertyWithImages[]> {
    const results = await db
      .select({
        ...properties,
        images: propertyImages,
        owner: {
          id: users.id,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
        },
      })
      .from(properties)
      .leftJoin(propertyImages, eq(properties.id, propertyImages.propertyId))
      .leftJoin(users, eq(properties.ownerId, users.id))
      .where(eq(properties.ownerId, ownerId))
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset);

    // Organiser les résultats
    const propertyMap = new Map<string, PropertyWithImages>();

    results.forEach((row) => {
      const propertyId = row.id;

      if (!propertyMap.has(propertyId)) {
        propertyMap.set(propertyId, {
          ...row,
          images: [],
          owner: row.owner!,
        });
      }

      if (row.propertyImages) {
        const property = propertyMap.get(propertyId)!;
        property.images.push({
          id: row.propertyImages.id,
          imageUrl: row.propertyImages.imageUrl,
          alt: row.propertyImages.alt,
          order: row.propertyImages.order,
          isMain: row.propertyImages.isMain,
        });
      }
    });

    propertyMap.forEach((property) => {
      property.images.sort((a, b) => a.order - b.order);
    });

    return Array.from(propertyMap.values());
  }
}

export const propertyService = new PropertyService();
