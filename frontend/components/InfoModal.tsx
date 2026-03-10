import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    Linking,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { useImageUpload } from '@/lib/useImageUpload';

export type InfoModalType = 'DOCUMENTS' | 'NOTIFICATIONS' | 'VERIFICATION' | 'HELP' | 'ABOUT' | null;

interface InfoModalProps {
    visible: boolean;
    type: InfoModalType;
    onClose: () => void;
}

export default function InfoModal({ visible, type, onClose }: InfoModalProps) {
    const { colors } = useTheme();
    const [activeSection, setActiveSection] = useState<InfoModalType>(type);
    const { uploadImage, isUploading } = useImageUpload();
    
    // State for local document statuses (simulated)
    const [idStatus, setIdStatus] = useState<'PENDING' | 'UPLOADED'>('PENDING');
    const [residenceStatus, setResidenceStatus] = useState<'PENDING' | 'UPLOADED'>('PENDING');

    // Update activeSection when prop changes (when opening from profile)
    useEffect(() => {
        setActiveSection(type);
    }, [type, visible]);

    const handleUploadDoc = async (docType: 'ID' | 'RESIDENCE') => {
        try {
            const result = await uploadImage('doc');
            if (result) {
                if (docType === 'ID') setIdStatus('UPLOADED');
                else setResidenceStatus('UPLOADED');
                Alert.alert("Succès", "Document envoyé avec succès ! Il sera vérifié par notre équipe.");
            } else {
                Alert.alert("Erreur", "L'upload a échoué ou a été annulé.");
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible d'envoyer le document.");
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'DOCUMENTS':
                return (
                    <View style={styles.section}>
                        <InfoItem 
                            icon="document-attach-outline" 
                            title="Pièce d'identité" 
                            desc={idStatus === 'UPLOADED' ? "Envoyé pour vérification" : "Carte d'identité ou Passeport"} 
                            status={idStatus}
                            onPress={() => handleUploadDoc('ID')}
                            loading={isUploading}
                        />
                        <InfoItem 
                            icon="home-outline" 
                            title="Justificatif de domicile" 
                            desc={residenceStatus === 'UPLOADED' ? "Envoyé pour vérification" : "Facture EDG/SEG ou Certificat"} 
                            status={residenceStatus}
                            onPress={() => handleUploadDoc('RESIDENCE')}
                            loading={isUploading}
                        />
                        <Text style={[styles.hint, { color: colors.textMuted }]}>
                            Ces documents sont nécessaires pour devenir un utilisateur vérifié.
                        </Text>
                    </View>
                );
            case 'NOTIFICATIONS':
                return (
                    <View style={styles.section}>
                        <ToggleItem label="Alertes Immobilières" value={true} />
                        <ToggleItem label="Messages des propriétaires" value={true} />
                        <ToggleItem label="Offres promotionnelles" value={false} />
                        <ToggleItem label="Email hebdomadaire" value={false} />
                    </View>
                );
            case 'HELP':
                return (
                    <View style={styles.section}>
                        <Pressable 
                            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => Linking.openURL('https://wa.me/224000000000')}
                        >
                            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Support WhatsApp</Text>
                                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>Réponse rapide 7j/7</Text>
                            </View>
                        </Pressable>
                        <Pressable 
                            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}
                            onPress={() => Linking.openURL('mailto:support@louma.gn')}
                        >
                            <Ionicons name="mail-outline" size={24} color={colors.primary} />
                            <View style={styles.actionText}>
                                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Email</Text>
                                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>support@louma.gn</Text>
                            </View>
                        </Pressable>
                    </View>
                );
            case 'ABOUT':
                return (
                    <View style={styles.section}>
                        <Text style={[styles.aboutText, { color: colors.textPrimary }]}>
                            LOUMA est la première plateforme immobilière moderne en Guinée, conçue pour simplifier la recherche et la gestion de biens immobiliers.
                        </Text>
                        <View style={[styles.versionTag, { backgroundColor: colors.surface }]}>
                            <Text style={{ color: colors.textSecondary }}>Version 1.0.0 (Propulsé par Louma Labs)</Text>
                        </View>
                        <View style={styles.linkRow}>
                           <Text style={{ color: colors.primary }}>Conditions d'utilisation</Text>
                           <Text style={{ color: colors.primary }}>Confidentialité</Text>
                        </View>
                    </View>
                );
            case 'VERIFICATION':
                return (
                    <View style={styles.section}>
                        <View style={styles.center}>
                            <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
                            <Text style={[styles.verifyTitle, { color: colors.textPrimary }]}>Devenir Utilisateur Vérifié</Text>
                            <Text style={[styles.verifyDesc, { color: colors.textSecondary }]}>
                                Le badge de vérification augmente de 3x vos chances de trouver un bien ou un locataire.
                            </Text>
                            <Pressable 
                                style={[styles.btn, { backgroundColor: colors.primary }]}
                                onPress={() => setActiveSection('DOCUMENTS')}
                            >
                                <Text style={styles.btnText}>Commencer la vérification</Text>
                            </Pressable>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (activeSection) {
            case 'DOCUMENTS': return 'Mes Documents';
            case 'NOTIFICATIONS': return 'Notifications';
            case 'HELP': return 'Centre d\'aide';
            case 'ABOUT': return 'À propos de LOUMA';
            case 'VERIFICATION': return 'Vérification';
            default: return '';
        }
    }

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        {activeSection !== type && (
                            <Pressable onPress={() => setActiveSection(type)} style={{ marginRight: 12 }}>
                                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                            </Pressable>
                        )}
                        <Text style={[styles.title, { color: colors.textPrimary }]}>{getTitle()}</Text>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>
                    <ScrollView contentContainerStyle={styles.scroll}>
                        {renderContent()}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function InfoItem({ icon, title, desc, status, onPress, loading }: any) {
    const { colors } = useTheme();
    return (
        <Pressable 
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={onPress}
            disabled={loading || status === 'UPLOADED'}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
                {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name={icon} size={20} color={colors.textSecondary} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.itemDesc, { color: colors.textMuted }]}>{desc}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: status === 'UPLOADED' ? 'rgba(76,175,80,0.1)' : 'rgba(255,165,0,0.1)' }]}>
                <Text style={{ color: status === 'UPLOADED' ? '#4CAF50' : 'orange', fontSize: 10, fontWeight: '700' }}>
                    {status === 'UPLOADED' ? 'REÇU' : 'À COMPLÉTER'}
                </Text>
            </View>
        </Pressable>
    );
}

function ToggleItem({ label, value }: any) {
    const { colors } = useTheme();
    const [val, setVal] = React.useState(value);
    return (
        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.textPrimary, fontSize: 15 }}>{label}</Text>
            <Switch value={val} onValueChange={setVal} trackColor={{ true: colors.primary }} />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    content: { borderRadius: 24, maxHeight: '80%', overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 18, fontWeight: '800', flex: 1 },
    closeBtn: { padding: 4 },
    scroll: { padding: 20 },
    section: { paddingBottom: 20 },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5 },
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    itemTitle: { fontSize: 15, fontWeight: '600' },
    itemDesc: { fontSize: 12, marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    hint: { fontSize: 12, marginTop: 16, textAlign: 'center', fontStyle: 'italic' },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5 },
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
    actionText: { marginLeft: 16 },
    actionTitle: { fontSize: 16, fontWeight: '700' },
    actionDesc: { fontSize: 13, marginTop: 2 },
    aboutText: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
    versionTag: { padding: 12, borderRadius: 12, marginTop: 20, alignItems: 'center' },
    linkRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
    center: { alignItems: 'center', paddingVertical: 20 },
    verifyTitle: { fontSize: 20, fontWeight: '800', marginTop: 16, textAlign: 'center' },
    verifyDesc: { fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
    btn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 28 },
    btnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
