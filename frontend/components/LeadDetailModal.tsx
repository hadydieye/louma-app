import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/lib/useTheme';
import { leadService } from '@/services/leadService';
import { UpdateLeadStatusPayload, formatGNF } from '@/lib/types';

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
        mutationFn: (data: UpdateLeadStatusPayload) => leadService.updateLeadStatus(lead.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            onClose();
        },
    });

    if (!lead) return null;

    const handleUpdateStatus = (status: any) => {
        mutation.mutate({ status });
    };

    const handleCall = () => {
        if (lead.user?.phone) {
            Linking.openURL(`tel:${lead.user.phone}`);
        }
    };

    const handleWhatsApp = () => {
        if (lead.user?.phone) {
            const phone = lead.user.phone.replace(/\s/g, '');
            const message = `Bonjour ${lead.user.fullName}, je vous contacte concernant votre demande pour le bien "${lead.property?.title}" sur LOUMA.`;
            Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
        }
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
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                                {isOwner ? 'Le Locataire' : 'Ma Demande'}
                            </Text>
                            <View style={styles.userCard}>
                                <View style={[styles.userAvatar, { backgroundColor: isOwner ? 'rgba(0,122,255,0.1)' : 'rgba(184,245,58,0.1)' }]}>
                                    <Ionicons 
                                        name={isOwner ? "person" : "home"} 
                                        size={24} 
                                        color={isOwner ? "#007AFF" : "#B8F53A"} 
                                    />
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, { color: colors.textPrimary }]}>
                                        {isOwner ? lead.user?.fullName : lead.property?.title}
                                    </Text>
                                    <Text style={[styles.userSub, { color: colors.textSecondary }]}>
                                        {isOwner ? lead.user?.phone : `${lead.property?.commune}, ${lead.property?.quartier}`}
                                    </Text>
                                </View>
                                {isOwner && (
                                    <View style={styles.scoreBadge}>
                                        <Text style={styles.scoreValue}>{lead.user?.completionPercent || 0}%</Text>
                                        <Text style={styles.scoreLabel}>Fiabilité</Text>
                                    </View>
                                )}
                            </View>

                            {isOwner && (
                                <View style={styles.contactActions}>
                                    <Pressable 
                                        style={[styles.contactBtn, { backgroundColor: '#25D366' }]} 
                                        onPress={handleWhatsApp}
                                    >
                                        <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
                                        <Text style={styles.contactBtnText}>WhatsApp</Text>
                                    </Pressable>
                                    <Pressable 
                                        style={[styles.contactBtn, { backgroundColor: colors.primary }]} 
                                        onPress={handleCall}
                                    >
                                        <Ionicons name="call" size={18} color="#0D0D0D" />
                                        <Text style={[styles.contactBtnText, { color: '#0D0D0D' }]}>Appeler</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        {!isOwner && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Statut de la demande</Text>
                                <View style={styles.statusTracker}>
                                    {STATUS_OPTIONS.map((step, idx) => {
                                        const isPast = STATUS_OPTIONS.findIndex(s => s.value === lead.status) >= idx;
                                        const isCurrent = lead.status === step.value;
                                        return (
                                            <View key={step.value} style={styles.statusStep}>
                                                <View style={[
                                                    styles.statusDot, 
                                                    { backgroundColor: isPast ? colors.primary : colors.border }
                                                ]}>
                                                    {isPast && <Ionicons name="checkmark" size={12} color="#0D0D0D" />}
                                                </View>
                                                <Text style={[
                                                    styles.statusStepLabel, 
                                                    { color: isCurrent ? colors.textPrimary : colors.textMuted, fontWeight: isCurrent ? '700' : '400' }
                                                ]}>
                                                    {step.label}
                                                </Text>
                                                {idx < STATUS_OPTIONS.length - 1 && (
                                                    <View style={[styles.statusLine, { backgroundColor: isPast && lead.status !== step.value ? colors.primary : colors.border }]} />
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Détails partagés</Text>
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
    
    // User Card
    userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    userAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '700' },
    userSub: { fontSize: 13, marginTop: 2 },
    scoreBadge: { alignItems: 'center', backgroundColor: 'rgba(52,199,89,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    scoreValue: { fontSize: 15, fontWeight: '800', color: '#34C759' },
    scoreLabel: { fontSize: 9, fontWeight: '600', color: '#34C759', textTransform: 'uppercase' },

    // Status Tracker
    statusTracker: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 8 },
    statusStep: { alignItems: 'center', flex: 1 },
    statusDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    statusLine: { position: 'absolute', top: 10, left: '60%', width: '80%', height: 2, zIndex: 1 },
    statusStepLabel: { fontSize: 10, marginTop: 8, textAlign: 'center' },

    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    infoText: { fontSize: 15, fontWeight: '500' },
    contactActions: { flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 4 },
    contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
    contactBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
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
