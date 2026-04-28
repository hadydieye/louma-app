import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTheme } from '@/lib/useTheme';
import { leadService } from '@/services/leadService';
import { CreateLeadPayload, formatGNF } from '@/lib/types';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

interface LeadSubmissionModalProps {
    visible: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
    priceGNF: number;
    isGuest: boolean;
}

const PHONE_REGEX = /^(\+224|00224|0)?(6[0-9]{8}|7[0-9]{8})$/;

function validatePhone(phone: string): boolean {
    return PHONE_REGEX.test(phone.replace(/\s/g, ''));
}

export default function LeadSubmissionModal({
    visible,
    onClose,
    propertyId,
    propertyTitle,
    priceGNF,
    isGuest,
}: LeadSubmissionModalProps) {
    const { colors } = useTheme();
    const queryClient = useQueryClient();

    const [guestName, setGuestName] = useState('');
    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState('');
    const [budget, setBudget] = useState(String(priceGNF));
    const [duration, setDuration] = useState('12');
    const [household, setHousehold] = useState('1');
    const [submitted, setSubmitted] = useState(false);

    // Inline error state
    const [errors, setErrors] = useState<{ guestName?: string; phone?: string }>({});

    const mutation = useMutation({
        mutationFn: (data: CreateLeadPayload) => leadService.createLead(data),
        onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setSubmitted(true);
        },
        onError: (error: Error) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setErrors({ phone: error.message || 'Une erreur est survenue.' });
        },
    });

    const handleClose = () => {
        // Reset state on close
        setGuestName('');
        setMessage('');
        setPhone('');
        setBudget(String(priceGNF));
        setDuration('12');
        setHousehold('1');
        setSubmitted(false);
        setErrors({});
        onClose();
    };

    const handleSubmit = () => {
        const newErrors: typeof errors = {};

        if (isGuest && !guestName.trim()) {
            newErrors.guestName = 'Votre nom est requis pour que le propriétaire puisse vous identifier.';
        }
        if (!phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est requis.';
        } else if (!validatePhone(phone)) {
            newErrors.phone = 'Format invalide. Ex: 620 000 000 ou +224 620 000 000';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        mutation.mutate({
            propertyId,
            message: isGuest ? `[Visiteur: ${guestName.trim()}]\n${message}` : message,
            budgetGNF: parseInt(budget) || undefined,
            desiredDurationMonths: parseInt(duration) || undefined,
            householdSize: parseInt(household) || undefined,
            ...(isGuest
                ? { guestName: guestName.trim(), guestPhone: phone.trim() }
                : { phone: phone.trim() }),
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Je suis intéressé(e)</Text>
                        <Pressable onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    {submitted ? (
                        <View style={styles.successContainer}>
                            <View style={[styles.successIcon, { backgroundColor: 'rgba(184,245,58,0.12)' }]}>
                                <Ionicons name="checkmark-circle" size={56} color="#B8F53A" />
                            </View>
                            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>
                                Demande envoyée !
                            </Text>
                            <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                                Votre demande a été envoyée. Le propriétaire vous contactera sur le numéro indiqué.
                            </Text>
                            <Pressable
                                onPress={handleClose}
                                style={[styles.submitBtn, { marginTop: 32 }]}
                            >
                                <Text style={styles.submitText}>Fermer</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            <KeyboardAwareScrollViewCompat
                                style={styles.body}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View style={[styles.propertyBrief, { backgroundColor: colors.surface }]}>
                                    <Text style={[styles.briefTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                                        {propertyTitle}
                                    </Text>
                                    <Text style={[styles.briefPrice, { color: colors.primary }]}>{formatGNF(priceGNF)}/mois</Text>
                                </View>

                                {isGuest && (
                                    <View style={styles.formGroup}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                                            Votre nom complet <Text style={{ color: '#FF3B30' }}>*</Text>
                                        </Text>
                                        <TextInput
                                            value={guestName}
                                            onChangeText={(v) => { setGuestName(v); setErrors(e => ({ ...e, guestName: undefined })); }}
                                            placeholder="Ex: Mamadou Diallo"
                                            placeholderTextColor={colors.textMuted}
                                            autoCapitalize="words"
                                            style={[styles.input, {
                                                backgroundColor: colors.surface,
                                                color: colors.textPrimary,
                                                borderColor: errors.guestName ? '#FF3B30' : colors.border,
                                            }]}
                                        />
                                        {errors.guestName && (
                                            <Text style={styles.errorText}>{errors.guestName}</Text>
                                        )}
                                    </View>
                                )}

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                                        Numéro de téléphone <Text style={{ color: '#FF3B30' }}>*</Text>
                                    </Text>
                                    <TextInput
                                        value={phone}
                                        onChangeText={(v) => { setPhone(v); setErrors(e => ({ ...e, phone: undefined })); }}
                                        keyboardType="phone-pad"
                                        placeholder="Ex: 620 000 000"
                                        placeholderTextColor={colors.textMuted}
                                        style={[styles.input, {
                                            backgroundColor: colors.surface,
                                            color: colors.textPrimary,
                                            borderColor: errors.phone ? '#FF3B30' : colors.border,
                                        }]}
                                    />
                                    {errors.phone ? (
                                        <Text style={styles.errorText}>{errors.phone}</Text>
                                    ) : (
                                        <Text style={[styles.hint, { color: colors.textMuted }]}>
                                            Le propriétaire vous contactera sur ce numéro
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Budget max (GNF/mois)</Text>
                                    <TextInput
                                        value={budget}
                                        onChangeText={setBudget}
                                        keyboardType="numeric"
                                        style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.formGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>Durée (mois)</Text>
                                        <TextInput
                                            value={duration}
                                            onChangeText={setDuration}
                                            keyboardType="numeric"
                                            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                        />
                                    </View>
                                    <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                        <Text style={[styles.label, { color: colors.textSecondary }]}>Nb. personnes</Text>
                                        <TextInput
                                            value={household}
                                            onChangeText={setHousehold}
                                            keyboardType="numeric"
                                            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>Message (optionnel)</Text>
                                    <TextInput
                                        value={message}
                                        onChangeText={setMessage}
                                        multiline
                                        numberOfLines={4}
                                        placeholder="Ex: Je suis disponible pour une visite demain..."
                                        placeholderTextColor={colors.textMuted}
                                        style={[styles.textArea, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                                    />
                                </View>

                                <View style={{ height: 20 }} />
                            </KeyboardAwareScrollViewCompat>

                            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                                <Pressable
                                    onPress={handleSubmit}
                                    disabled={mutation.isPending}
                                    style={[styles.submitBtn, mutation.isPending && { opacity: 0.7 }]}
                                >
                                    {mutation.isPending ? (
                                        <ActivityIndicator color="#0D0D0D" />
                                    ) : (
                                        <Text style={styles.submitText}>Envoyer ma demande</Text>
                                    )}
                                </Pressable>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: { fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 4 },
    body: { padding: 20 },
    propertyBrief: { padding: 16, borderRadius: 12, marginBottom: 24 },
    briefTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    briefPrice: { fontSize: 16, fontWeight: '800' },
    formGroup: { marginBottom: 20 },
    row: { flexDirection: 'row' },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
    textArea: {
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        fontSize: 15,
        textAlignVertical: 'top',
    },
    errorText: { fontSize: 12, color: '#FF3B30', marginTop: 4 },
    hint: { fontSize: 11, marginTop: 4 },
    footer: { padding: 20, borderTopWidth: 1 },
    submitBtn: {
        backgroundColor: '#B8F53A',
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: { fontSize: 16, fontWeight: '700', color: '#0D0D0D' },
    // Success screen
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    successIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
    successSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
