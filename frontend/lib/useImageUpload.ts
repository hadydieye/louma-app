import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

type UploadType = 'property' | 'avatar' | 'doc';

interface UseImageUploadReturn {
    uploadImage: (type?: UploadType) => Promise<string | null>;
    isUploading: boolean;
    imageUrl: string | null;
    error: string | null;
}

export const useImageUpload = (): UseImageUploadReturn => {
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const uploadImage = async (type: UploadType = 'property'): Promise<string | null> => {
        try {
            console.log(`[useImageUpload] Starting upload for type: ${type}`);
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
                quality: 0.7,
                base64: true, // Request base64
            });

            if (result.canceled) {
                console.log('[useImageUpload] User canceled image picker');
                setIsUploading(false);
                return null;
            }

            const selectedImage = result.assets[0];
            const uri = selectedImage.uri;
            const base64Str = selectedImage.base64;
            console.log(`[useImageUpload] Image picked: ${uri}`);

            // Prepare file name and path
            // We use 'properties/' as the root prefix because the bucket 'property-images' 
            // likely has RLS policies restricted to this prefix.
            const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            
            let path = '';
            if (type === 'avatar') {
                path = `properties/avatars/${user.id}/${fileName}`;
            } else if (type === 'doc') {
                path = `properties/docs/${user.id}/${fileName}`;
            } else {
                path = `properties/${fileName}`;
            }

            console.log(`[useImageUpload] Uploading to path: ${path}`);

            // Determine MIME type
            const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

            if (!base64Str) {
                throw new Error("Impossible de lire l'image.");
            }

            // Dynamic import to avoid errors in environments without base64-arraybuffer
            const { decode } = await import('base64-arraybuffer');

            // Upload to Supabase Storage using ArrayBuffer (Most reliable for React Native/Expo)
            const { data, error: storageError } = await supabase.storage
                .from('property-images')
                .upload(path, decode(base64Str), {
                    contentType: mimeType,
                    upsert: true
                });

            if (storageError) {
                console.error('[useImageUpload] Storage error details:', JSON.stringify(storageError, null, 2));
                throw storageError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(path);

            console.log(`[useImageUpload] Upload success! URL: ${publicUrl}`);
            setImageUrl(publicUrl);
            return publicUrl;

        } catch (err: any) {
            console.error('[useImageUpload] Final catch error:', err);
            
            // Show detailed alert for debugging
            const errorDetails = err.message || JSON.stringify(err);
            import('react-native').then(({ Alert }) => {
                Alert.alert("Erreur d'Upload", `Détails: ${errorDetails}`);
            });

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
