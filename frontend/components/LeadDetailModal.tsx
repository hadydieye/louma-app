import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { leadsApi, UpdateLeadStatusPayload } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatGNF } from '@/lib/types';

interface LeadDetailModalProps {
    visible: boolean;
    onClose: () => void;
    lead: any;
    isOwner: boolean;
}

const STATUS_OPTIONS: { label: string; value: 'NEW' | 'CONTACTED' | 'VISITED' | 'CLOSED' }[] = [
    { label: 'Nouveau', value: 'NEW' },
    { label: 'Contacté', value: 'CONTACTED' },
    { label: 'Visité', value: 'VISITED' },
    { label: 'Clos', value: 'CLOSED' },
];

export default function LeadDetailModal({ visible, onClose, lead, isOwner }: LeadDetailModalProps) {
    const { colors } = useTheme();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: UpdateLeadStatusPayload) => leadsApi.updateStatus(lead.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            onClose();
        },
    });

    if (!lead) return null;

    const handleUpdateStatus = (status: any) => {
        mutation.mutate({ status });
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Détails de la demande</Text>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Bien immobilier</Text>
                            <Text style={[styles.propertyTitle, { color: colors.textPrimary }]}>{lead.property?.title}</Text>
                            <Text style={[styles.propertyLocation, { color: colors.textMuted }]}>
                                {lead.property?.commune}, {lead.property?.quartier}
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Informations locataire</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color={colors.textMuted} />
                                <Text style={[styles.infoText, { color: colors.textPrimary }]}>{lead.user?.fullName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={16} color={colors.textMuted} />
                                <Text style={[styles.infoText, { color: colors.textPrimary }]}>{lead.user?.phone}</Text>
                            </View>
                            {lead.user?.profession && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
                                    <Text style={[styles.infoText, { color: colors.textPrimary }]}>{lead.user.profession}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Critères de la demande</Text>
                            <View style={styles.grid}>
                                <View style={styles.gridItem}>
                                    <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Budget</Text>
                                    <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{formatGNF(lead.budgetGNF)}</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Taille foyer</Text>
                                    <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{lead.householdSize} personnes</Text>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={[styles.gridLabel, { color: colors.textMuted }]}>Durée souhaitée</Text>
                                    <Text style={[styles.gridValue, { color: colors.textPrimary }]}>{lead.desiredDurationMonths} mois</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Message</Text>
                            <View style={[styles.messageBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Text style={[styles.messageText, { color: colors.textSecondary }]}>
                                    {lead.message || 'Aucun message particulier.'}
                                </Text>
                            </View>
                        </View>

                        {isOwner && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Gérer le statut</Text>
                                <View style={styles.statusGrid}>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Pressable
                                            key={opt.value}
                                            onPress={() => handleUpdateStatus(opt.value)}
                                            disabled={mutation.isPending}
                                            style={[
                                                styles.statusBtn,
                                                { borderColor: colors.border },
                                                lead.status === opt.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                                            ]}
                                        >
                                            <Text style={[styles.statusBtnText, { color: lead.status === opt.value ? '#0D0D0D' : colors.textPrimary }]}>
                                                {opt.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {mutation.isPending && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator color={colors.primary} size="large" />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    content: { borderRadius: 24, maxHeight: '80%', overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 4 },
    body: { padding: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    propertyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
    propertyLocation: { fontSize: 14 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    infoText: { fontSize: 15, fontWeight: '500' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    gridItem: { minWidth: '45%' },
    gridLabel: { fontSize: 11, marginBottom: 4 },
    gridValue: { fontSize: 14, fontWeight: '600' },
    messageBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
    messageText: { fontSize: 14, lineHeight: 20 },
    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, minWidth: '48%', alignItems: 'center' },
    statusBtnText: { fontSize: 13, fontWeight: '700' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
});
