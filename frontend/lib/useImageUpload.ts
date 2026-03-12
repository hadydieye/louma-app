import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './AuthContext';
import { propertyService } from '@/services/propertyService';

type UploadType = 'properties' | 'avatars' | 'docs';

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

    const uploadImage = async (type: UploadType = 'properties'): Promise<string | null> => {
        try {
            console.log(`[useImageUpload] Picking image for type: ${type}`);
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
                aspect: type === 'avatars' ? [1, 1] : [4, 3],
                quality: 0.7,
            });

            if (result.canceled) {
                console.log('[useImageUpload] User canceled image picker');
                setIsUploading(false);
                return null;
            }

            const selectedImage = result.assets[0];
            const uri = selectedImage.uri;
            console.log(`[useImageUpload] Image picked: ${uri}. Starting upload via service...`);

            // Use the centralized service for upload
            const publicUrl = await propertyService.uploadToStorage(uri, type);

            console.log(`[useImageUpload] Upload success! URL: ${publicUrl}`);
            setImageUrl(publicUrl);
            return publicUrl;

        } catch (err: any) {
            console.error('[useImageUpload] Error:', err);
            
            // Show alert for debugging
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
