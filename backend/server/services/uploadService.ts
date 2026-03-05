import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define storage for Properties
const propertiesStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'louma/properties',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    } as any,
});

// Define storage for Avatars
const avatarsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'louma/avatars',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    } as any,
});

export const propertyUpload = multer({ storage: propertiesStorage });
export const avatarUpload = multer({ storage: avatarsStorage });

/**
 * Supprime une image de Cloudinary à partir de son URL
 */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
    try {
        // L'URL ressemble à: https://res.cloudinary.com/[cloud_name]/image/upload/v123456789/louma/properties/abc.jpg
        // On doit extraire le public_id: louma/properties/abc
        const parts = url.split('/');
        const fileNameWithExt = parts[parts.length - 1]; // abc.jpg
        const fileName = fileNameWithExt.split('.')[0]; // abc

        // On récupère les dossiers parents s'ils existent (ex: louma/properties)
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return false;

        // Les parties après 'v123456789' (ou après 'upload' si pas de version)
        const publicIdParts = parts.slice(uploadIndex + 2); // Saute 'upload' et 'v...'
        publicIdParts[publicIdParts.length - 1] = fileName;
        const publicId = publicIdParts.join('/');

        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
}

export default cloudinary;
