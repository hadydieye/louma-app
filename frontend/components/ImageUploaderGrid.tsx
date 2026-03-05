import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';
import { useImageUpload } from '@/lib/useImageUpload';
import { propertiesApi } from '@/lib/api';
import { PropertyImage } from '@/lib/types';

interface ImageUploaderGridProps {
    propertyId: string;
    images: PropertyImage[];
    onImagesChange: () => void;
}

export default function ImageUploaderGrid({ propertyId, images, onImagesChange }: ImageUploaderGridProps) {
    const { colors } = useTheme();
    const { uploadImage, isUploading } = useImageUpload();
    const [localIsUploading, setLocalIsUploading] = useState(false);

    const handleAddImage = async () => {
        try {
            setLocalIsUploading(true);
            const url = await uploadImage('property');

            if (url) {
                // Link to property
                await propertiesApi.addImage(propertyId, {
                    imageUrl: url,
                    isMain: images.length === 0
                });
                onImagesChange();
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "Impossible d'ajouter l'image");
        } finally {
            setLocalIsUploading(false);
        }
    };

    const handleDelete = async (imageId: string) => {
        Alert.alert(
            'Supprimer l\'image',
            'Êtes-vous sûr de vouloir supprimer cette image ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await propertiesApi.removeImage(propertyId, imageId);
                            onImagesChange();
                        } catch (error: any) {
                            Alert.alert('Erreur', error.message || "Impossible de supprimer l'image");
                        }
                    }
                }
            ]
        );
    };

    const handleSetMain = async (imageId: string) => {
        try {
            await propertiesApi.setMainImage(propertyId, imageId);
            onImagesChange();
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "Impossible de changer l'image principale");
        }
    };

    // Sort images: main first, then by order
    const sortedImages = [...images].sort((a, b) => {
        if (a.isMain) return -1;
        if (b.isMain) return 1;
        return a.order - b.order;
    });

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {sortedImages.map((img) => (
                    <Animated.View
                        key={img.id}
                        entering={FadeIn}
                        exiting={FadeOut}
                        layout={Layout.springify()}
                        style={[styles.item, { borderColor: img.isMain ? colors.primary : colors.border }]}
                    >
                        <Image
                            source={{ uri: img.imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                        />

                        {img.isMain && (
                            <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.mainBadgeText}>Principale</Text>
                            </View>
                        )}

                        <View style={styles.overlay}>
                            <Pressable
                                onPress={() => handleDelete(img.id)}
                                style={[styles.actionBtn, { backgroundColor: 'rgba(255, 59, 48, 0.8)' }]}
                            >
                                <Ionicons name="trash-outline" size={16} color="#FFF" />
                            </Pressable>

                            {!img.isMain && (
                                <Pressable
                                    onPress={() => handleSetMain(img.id)}
                                    style={[styles.actionBtn, { backgroundColor: 'rgba(0, 122, 255, 0.8)' }]}
                                >
                                    <Ionicons name="star-outline" size={16} color="#FFF" />
                                </Pressable>
                            )}
                        </View>
                    </Animated.View>
                ))}

                <Pressable
                    onPress={handleAddImage}
                    disabled={isUploading || localIsUploading}
                    style={[
                        styles.addButton,
                        { backgroundColor: colors.surface, borderColor: colors.border }
                    ]}
                >
                    {isUploading || localIsUploading ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <>
                            <Ionicons name="add-outline" size={32} color={colors.textSecondary} />
                            <Text style={[styles.addText, { color: colors.textSecondary }]}>Ajouter</Text>
                        </>
                    )}
                </Pressable>
            </View>
            <Text style={[styles.hint, { color: colors.textMuted }]}>
                L&apos;image principale est celle affichée en premier sur les listes.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 12 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    item: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    mainBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    mainBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0D0D0D',
    },
    overlay: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    hint: {
        fontSize: 12,
        marginTop: 12,
        fontStyle: 'italic',
    },
});
