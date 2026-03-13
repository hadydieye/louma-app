import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';

import { useTheme } from '@/lib/useTheme';
import { propertyService } from '@/services/propertyService';
import { formatGNF } from '@/lib/types';

export default function MyPropertiesTabScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const queryClient = useQueryClient();
    const topInset = Platform.OS === 'web' ? 20 : insets.top;

    const { data: properties, isLoading, refetch } = useQuery({
        queryKey: ['my-properties'],
        queryFn: () => propertyService.getMyProperties(),
    });

    // Refresh when tab focused
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const deleteMutation = useMutation({
        mutationFn: (id: string) => propertyService.deleteProperty(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-properties'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            Alert.alert("Succès", "L'annonce a été supprimée.");
        },
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            "Supprimer l'annonce",
            "Voulez-vous vraiment supprimer cette annonce ? Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const mainImage = item.images.find((i: any) => i.isMain) || item.images[0];

        return (
            <Pressable 
                style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/property/${item.id}` as any)}
            >
                <Image 
                    source={{ uri: mainImage?.imageUrl }} 
                    style={styles.itemImage}
                    contentFit="cover"
                />
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.itemLocation, { color: colors.textSecondary }]}>
                        {item.commune}, {item.quartier}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>
                        {formatGNF(item.priceGNF)}
                    </Text>
                    
                    <View style={styles.itemActions}>
                        <Pressable 
                            style={[styles.actionBtn, { backgroundColor: 'rgba(255,68,68,0.1)' }]}
                            onPress={() => handleDelete(item.id)}
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF4444" />
                            <Text style={[styles.actionText, { color: '#FF4444' }]}>Supprimer</Text>
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: topInset + 12 }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Gérer mes annonces</Text>
                <Pressable onPress={() => router.push('/property/create')} style={styles.addBtn}>
                    <Ionicons name="add" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={properties}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="home-outline" size={64} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                Vous n'avez pas encore publié d'annonces.
                            </Text>
                            <Pressable 
                                style={[styles.createBtn, { backgroundColor: colors.primary }]}
                                onPress={() => router.push('/property/create')}
                            >
                                <Text style={styles.createBtnText}>Publier ma première annonce</Text>
                            </Pressable>
                        </View>
                    }
                    refreshing={isLoading}
                    onRefresh={refetch}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    title: { fontSize: 24, fontWeight: '900' },
    addBtn: { padding: 4, marginRight: -4 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    itemCard: {
        flexDirection: 'row',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    itemImage: { width: 100, height: '100%' },
    itemInfo: { flex: 1, padding: 12 },
    itemTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    itemLocation: { fontSize: 13, marginBottom: 8 },
    itemPrice: { fontSize: 15, fontWeight: '800', marginBottom: 12 },
    itemActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    actionText: { fontSize: 12, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 15, textAlign: 'center', marginTop: 16, marginBottom: 24, paddingHorizontal: 40 },
    createBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
    createBtnText: { fontSize: 15, fontWeight: '700', color: '#0D0D0D' },
});
