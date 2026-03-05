import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiRequest } from './api';
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

            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access gallery is required');
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

            // Create form data
            const formData = new FormData();

            // Extract file name and type from URI
            const fileName = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const fileType = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri,
                name: fileName,
                type: fileType,
            } as any);

            // Determine endpoint
            const endpoint = type === 'avatar' ? '/api/upload/avatar' : '/api/upload';

            // Upload to our API
            const response = await apiRequest(endpoint, {
                method: 'POST',
                body: formData,
                // FormData is handled by apiRequest if it detects it, 
                // but often we need to let the browser/native layer set the Content-Type with boundary
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await response.json();
            setImageUrl(data.imageUrl);
            return data.imageUrl;

        } catch (err: any) {
            const msg = err.message || 'An error occurred during upload';
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
