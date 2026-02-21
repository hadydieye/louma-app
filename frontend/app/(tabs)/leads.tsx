import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/lib/useTheme';
import { leadsApi } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { formatGNF } from '@/lib/types';
import Animated, { FadeInDown } from 'react-native-reanimated';

import LeadDetailModal from '@/components/LeadDetailModal';

export default function LeadsScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'sent' | 'received'>(user?.role === 'OWNER' || user?.role === 'AGENCY' ? 'received' : 'sent');
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const topInset = Platform.OS === 'web' ? 20 : insets.top;

    const { data: sentLeads, isLoading: loadingSent } = useQuery({
        queryKey: ['leads', 'sent'],
        queryFn: () => leadsApi.myLeads(),
        enabled: !!user,
    });

    const { data: receivedLeads, isLoading: loadingReceived } = useQuery({
        queryKey: ['leads', 'received'],
        queryFn: () => leadsApi.forOwner(),
        enabled: !!user && (user.role === 'OWNER' || user.role === 'AGENCY'),
    });

    const isLoading = activeTab === 'sent' ? loadingSent : loadingReceived;
    const leads = ((activeTab === 'sent' ? sentLeads?.data : receivedLeads?.data) || []) as any[];

    const renderLeadItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100)}>
            <Pressable
                onPress={() => setSelectedLead(item)}
                style={({ pressed }) => [
                    styles.leadCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: 0.7 }
                ]}
            >
                <View style={styles.leadHeader}>
                    <View style={styles.propertyInfo}>
                        <Text style={[styles.propertyTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                            {item.property?.title || 'Propriété'}
                        </Text>
                        <Text style={[styles.leadDate, { color: colors.textMuted }]}>
                            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status).bg }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status).text }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.leadBody}>
                    <Text style={[styles.leadMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.message || 'Pas de message'}
                    </Text>
                    <View style={styles.leadMeta}>
                        <Text style={[styles.metaItem, { color: colors.textMuted }]}>
                            Budget: <Text style={{ color: colors.textPrimary }}>{formatGNF(item.budgetGNF)}</Text>
                        </Text>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: topInset + 12 }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Mes Demandes</Text>

                {(user?.role === 'OWNER' || user?.role === 'AGENCY') && (
                    <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
                        <Pressable
                            onPress={() => setActiveTab('sent')}
                            style={[styles.tab, activeTab === 'sent' && { backgroundColor: colors.primary }]}
                        >
                            <Text style={[styles.tabText, activeTab === 'sent' && { color: '#0D0D0D' }, activeTab !== 'sent' && { color: colors.textSecondary }]}>Envoyées</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setActiveTab('received')}
                            style={[styles.tab, activeTab === 'received' && { backgroundColor: colors.primary }]}
                        >
                            <Text style={[styles.tabText, activeTab === 'received' && { color: '#0D0D0D' }, activeTab !== 'received' && { color: colors.textSecondary }]}>Reçues</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={leads}
                    keyExtractor={(item) => item.id}
                    renderItem={renderLeadItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
                            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucune demande</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                {activeTab === 'sent'
                                    ? "Vous n'avez pas encore envoyé de demande pour un bien."
                                    : "Vous n'avez pas encore reçu de demandes pour vos biens."}
                            </Text>
                        </View>
                    }
                />
            )}

            <LeadDetailModal
                visible={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
                isOwner={activeTab === 'received'}
            />
        </View>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'NEW': return { bg: 'rgba(52, 199, 89, 0.15)', text: '#34C759' };
        case 'CONTACTED': return { bg: 'rgba(0, 122, 255, 0.15)', text: '#007AFF' };
        case 'VISITED': return { bg: 'rgba(255, 149, 0, 0.15)', text: '#FF9500' };
        case 'CLOSED': return { bg: 'rgba(142, 142, 147, 0.15)', text: '#8E8E93' };
        default: return { bg: 'rgba(142, 142, 147, 0.15)', text: '#8E8E93' };
    }
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 20 },
    tabs: { flexDirection: 'row', borderRadius: 12, padding: 4 },
    tab: { flex: 1, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    tabText: { fontSize: 13, fontWeight: '700' },
    list: { padding: 20, paddingBottom: 100 },
    leadCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    leadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    propertyInfo: { flex: 1, marginRight: 8 },
    propertyTitle: { fontSize: 15, fontWeight: '700' },
    leadDate: { fontSize: 11, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '800' },
    leadBody: { gap: 8 },
    leadMessage: { fontSize: 13, lineHeight: 18 },
    leadMeta: { flexDirection: 'row', alignItems: 'center' },
    metaItem: { fontSize: 12 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
    emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
});
