import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { propertyImages, type InsertPropertyImage } from "../../../shared/schema";

export interface ImageUploadResult {
  id: string;
  imageUrl: string;
  alt: string | null;
  order: number;
  isMain: boolean;
}

class ImageService {
  // Ajouter des images à une propriété
  async addImagesToProperty(
    propertyId: string, 
    images: Array<{ url: string; alt?: string; order?: number; isMain?: boolean }>
  ): Promise<ImageUploadResult[]> {
    const imageData = images.map((img: { url: string; alt?: string; order?: number; isMain?: boolean }, index: number) => ({
      propertyId,
      imageUrl: img.url,
      alt: img.alt || null,
      order: img.order ?? index,
      isMain: img.isMain ?? false,
    }));

    const results = await db
      .insert(propertyImages)
      .values(imageData)
      .returning();

    return results.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      alt: img.alt,
      order: img.order,
      isMain: img.isMain,
    }));
  }

  // Récupérer toutes les images d'une propriété
  async getPropertyImages(propertyId: string): Promise<ImageUploadResult[]> {
    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .orderBy(propertyImages.order);

    return images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      alt: img.alt,
      order: img.order,
      isMain: img.isMain,
    }));
  }

  // Mettre à jour une image
  async updateImage(
    imageId: string, 
    data: Partial<Pick<InsertPropertyImage, 'alt' | 'order' | 'isMain'>>
  ): Promise<ImageUploadResult | null> {
    const [image] = await db
      .update(propertyImages)
      .set(data)
      .where(eq(propertyImages.id, imageId))
      .returning();

    if (!image) return null;

    return {
      id: image.id,
      imageUrl: image.imageUrl,
      alt: image.alt,
      order: image.order,
      isMain: image.isMain,
    };
  }

  // Supprimer une image
  async deleteImage(imageId: string): Promise<boolean> {
    const result = await db
      .delete(propertyImages)
      .where(eq(propertyImages.id, imageId))
      .returning({ id: propertyImages.id });

    return result.length > 0;
  }

  // Supprimer toutes les images d'une propriété
  async deletePropertyImages(propertyId: string): Promise<number> {
    const result = await db
      .delete(propertyImages)
      .where(eq(propertyImages.propertyId, propertyId))
      .returning({ id: propertyImages.id });

    return result.length;
  }

  // Définir l'image principale
  async setMainImage(propertyId: string, imageId: string): Promise<boolean> {
    try {
      // D'abord, retirer le statut "main" de toutes les images de la propriété
      await db
        .update(propertyImages)
        .set({ isMain: false })
        .where(eq(propertyImages.propertyId, propertyId));

      // Ensuite, définir la nouvelle image principale
      const [result] = await db
        .update(propertyImages)
        .set({ isMain: true })
        .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)))
        .returning({ id: propertyImages.id });

      return result !== undefined;
    } catch (error) {
      console.error("Error setting main image:", error);
      return false;
    }
  }

  // Réorganiser l'ordre des images
  async reorderImages(propertyId: string, imageOrders: Array<{ imageId: string; order: number }>): Promise<boolean> {
    try {
      await db.transaction(async (tx) => {
        for (const { imageId, order } of imageOrders) {
          await tx
            .update(propertyImages)
            .set({ order })
            .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)));
        }
      });

      return true;
    } catch (error) {
      console.error("Error reordering images:", error);
      return false;
    }
  }

  // Valider qu'une image appartient à une propriété
  async validateImageOwnership(imageId: string, propertyId: string): Promise<boolean> {
    const image = await db
      .select({ id: propertyImages.id })
      .from(propertyImages)
      .where(and(eq(propertyImages.id, imageId), eq(propertyImages.propertyId, propertyId)))
      .limit(1);

    return image.length > 0;
  }
}

export const imageService = new ImageService();
