import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

interface UseImageUploadReturn {
    uploadImage: (type?: 'property' | 'avatar') => Promise<string | null>;
    isUploading: boolean;
    imageUrl: string | null;
    error: string | null;
}

export const useImageUpload = (): UseImageUploadReturn => {
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const uploadImage = async (type: 'property' | 'avatar' = 'property'): Promise<string | null> => {
        try {
            setIsUploading(true);
            setError(null);

            if (!user) {
                throw new Error('Vous devez être connecté pour uploader des images');
            }

            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission d\'accès à la gallerie requise');
            }

            // Pick the image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: type === 'avatar' ? [1, 1] : [4, 3],
                quality: 0.8,
            });

            if (result.canceled) {
                setIsUploading(false);
                return null;
            }

            const selectedImage = result.assets[0];
            const uri = selectedImage.uri;

            // Prepare file name and path
            const ext = uri.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}.${ext}`;
            const path = type === 'avatar'
                ? `avatars/${user.id}/${fileName}`
                : `properties/${fileName}`; // Ideally we'd have propertyId here, but for now we'll use a flat listing or the user can group them

            // Convert URI to Blob (Reliable in React Native/Expo)
            const response = await fetch(uri);
            const blob = await response.blob();

            // Upload to Supabase Storage
            const { data, error: storageError } = await supabase.storage
                .from('property-images')
                .upload(path, blob, {
                    contentType: `image/${ext}`,
                    upsert: true
                });

            if (storageError) {
                throw storageError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(path);

            setImageUrl(publicUrl);
            return publicUrl;

        } catch (err: any) {
            console.error('Upload error:', err);
            const msg = err.message || 'Une erreur est survenue lors de l\'upload';
            setError(msg);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadImage,
        isUploading,
        imageUrl,
        error,
    };
};
