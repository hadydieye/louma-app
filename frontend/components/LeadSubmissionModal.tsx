import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTheme } from '@/lib/useTheme';
import { leadsApi, CreateLeadPayload } from '@/lib/api';
import { formatGNF } from '@/lib/types';
import * as Haptics from 'expo-haptics';

interface LeadSubmissionModalProps {
    visible: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
    priceGNF: number;
}

export default function LeadSubmissionModal({
    visible,
    onClose,
    propertyId,
    propertyTitle,
    priceGNF,
}: LeadSubmissionModalProps) {
    const { colors } = useTheme();
    const queryClient = useQueryClient();

    const [message, setMessage] = useState('');
    const [budget, setBudget] = useState(String(priceGNF));
    const [duration, setDuration] = useState('12');
    const [household, setHousehold] = useState('1');
    const [status, setStatus] = useState('Salarié');

    const mutation = useMutation({
        mutationFn: (data: CreateLeadPayload) => leadsApi.create(data),
        onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            onClose();
            // Reset form
            setMessage('');
        },
        onError: (error: any) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert(error.message || "Une erreur est survenue");
        },
    });

    const handleSubmit = () => {
        mutation.mutate({
            propertyId,
            message,
            budgetGNF: parseInt(budget),
            desiredDurationMonths: parseInt(duration),
            householdSize: parseInt(household),
            professionalStatus: status,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Je suis intéressé(e)</Text>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <View style={[styles.propertyBrief, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.briefTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                                {propertyTitle}
                            </Text>
                            <Text style={[styles.briefPrice, { color: colors.primary }]}>{formatGNF(priceGNF)}/mois</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Votre budget max (GNF/mois)</Text>
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
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Message au propriétaire (Optionnel)</Text>
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
                    </ScrollView>

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
                </View>
            </KeyboardAvoidingView>
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
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        padding: 20,
    },
    propertyBrief: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    briefTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    briefPrice: {
        fontSize: 16,
        fontWeight: '800',
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 15,
    },
    textArea: {
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        fontSize: 15,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    submitBtn: {
        backgroundColor: '#B8F53A',
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0D0D0D',
    },
});
