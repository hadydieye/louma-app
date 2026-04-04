import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    TextInput,
    ActivityIndicator,
    Image,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Commune } from '@/lib/types';
import { useImageUpload } from '@/lib/useImageUpload';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

interface ProfileEditModalProps {
    visible: boolean;
    onClose: () => void;
    user: any;
}

const COMMUNES: Commune[] = ['Ratoma', 'Matam', 'Kaloum', 'Matoto', 'Dixinn'];

export default function ProfileEditModal({ visible, onClose, user }: ProfileEditModalProps) {
    const { colors } = useTheme();
    const queryClient = useQueryClient();
    const { updateProfile } = useAuth();

    // Form state
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profession, setProfession] = useState(user?.profession || '');
    const [commune, setCommune] = useState<Commune | ''>(user?.commune || '');
    const [householdSize, setHouseholdSize] = useState(user?.householdSize?.toString() || '');
    const [budget, setBudget] = useState(user?.budget?.toString() || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');

    const { uploadImage, isUploading } = useImageUpload();

    const handlePickImage = async () => {
        const url = await uploadImage('avatars');
        if (url) {
            setAvatar(url);
        }
    };

    const mutation = useMutation({
        mutationFn: (data: any) => updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
            // Invalidate property caches so the updated owner name/avatar
            // is reflected on property listings and detail pages
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property'] });
            onClose();
        },
    });

    const handleSave = () => {
        mutation.mutate({
            fullName,
            email: email || undefined,
            profession,
            commune: commune || undefined,
            householdSize: householdSize ? parseInt(householdSize) : undefined,
            budget: budget ? parseFloat(budget) : undefined,
            avatar: avatar || undefined,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Modifier mon profil</Text>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    <KeyboardAwareScrollViewCompat 
                        style={styles.form} 
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.avatarPickerSection}>
                            <TouchableOpacity
                                onPress={handlePickImage}
                                style={[styles.avatarPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                disabled={isUploading}
                            >
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={styles.avatarPreview} />
                                ) : (
                                    <Ionicons name="camera-outline" size={30} color={colors.textSecondary} />
                                )}
                                {isUploading && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator color={colors.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                                Changer la photo de profil
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Nom complet</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Ex: Amadou Diallo"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholder="votre@email.com"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Profession</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                value={profession}
                                onChangeText={setProfession}
                                placeholder="Ex: Ingénieur, Commerçant"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Commune de résidence</Text>
                            <View style={styles.communeGrid}>
                                {COMMUNES.map((c) => (
                                    <Pressable
                                        key={c}
                                        onPress={() => setCommune(c)}
                                        style={[
                                            styles.communeBtn,
                                            { borderColor: colors.border },
                                            commune === c && { backgroundColor: colors.primary, borderColor: colors.primary }
                                        ]}
                                    >
                                        <Text style={[styles.communeText, { color: commune === c ? '#0D0D0D' : colors.textPrimary }]}>{c}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Taille foyer</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                    value={householdSize}
                                    onChangeText={setHouseholdSize}
                                    keyboardType="numeric"
                                    placeholder="Ex: 4"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Budget (GNF)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                    value={budget}
                                    onChangeText={setBudget}
                                    keyboardType="numeric"
                                    placeholder="Ex: 3000000"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>

                        {mutation.isError && (
                            <Text style={styles.errorText}>
                                {mutation.error instanceof Error ? mutation.error.message : 'Une erreur est survenue'}
                            </Text>
                        )}

                        <View style={{ height: 40 }} />
                    </KeyboardAwareScrollViewCompat>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <Pressable
                            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                            onPress={handleSave}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <ActivityIndicator color="#0D0D0D" />
                            ) : (
                                <Text style={styles.saveBtnText}>Enregistrer</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { height: '90%' },
    content: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: { fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 4 },
    form: { flex: 1, padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: {
        height: 52,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        borderWidth: 1,
    },
    row: { flexDirection: 'row' },
    communeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    communeBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    communeText: { fontSize: 13, fontWeight: '600' },
    errorText: { color: '#FF3B30', fontSize: 14, textAlign: 'center', marginTop: -10, marginBottom: 10 },
    footer: { padding: 20, borderTopWidth: 1 },
    saveBtn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#0D0D0D' },
    avatarPickerSection: { alignItems: 'center', marginBottom: 24 },
    avatarPicker: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    avatarHint: { fontSize: 14, fontWeight: '600', marginTop: 10 },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center'
    },
});
