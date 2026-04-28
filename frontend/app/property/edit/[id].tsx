import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/lib/useTheme';
import { propertyService } from '@/services/propertyService';
import { COMMUNES, PROPERTY_TYPES, PropertyType, Commune, FurnishedType } from '@/lib/types';
import FilterChip from '@/components/FilterChip';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export default function EditPropertyScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const queryClient = useQueryClient();

    const { data: property, isLoading } = useQuery({
        queryKey: ['property', id],
        queryFn: () => propertyService.getPropertyById(id),
        enabled: !!id,
    });

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceGNF, setPriceGNF] = useState('');
    const [quartier, setQuartier] = useState('');
    const [commune, setCommune] = useState<Commune>('Ratoma');
    const [type, setType] = useState<PropertyType>('Appartement');
    const [furnished, setFurnished] = useState<FurnishedType>('Vide');
    const [bedrooms, setBedrooms] = useState('1');
    const [bathrooms, setBathrooms] = useState('1');

    useEffect(() => {
        if (!property) return;
        setTitle(property.title ?? '');
        setDescription(property.description ?? '');
        setPriceGNF(String(property.priceGNF ?? ''));
        setQuartier(property.quartier ?? '');
        setCommune((property.commune as Commune) ?? 'Ratoma');
        setType((property.type as PropertyType) ?? 'Appartement');
        setFurnished((property.furnished as FurnishedType) ?? 'Vide');
        setBedrooms(String(property.bedrooms ?? 1));
        setBathrooms(String(property.bathrooms ?? 1));
    }, [property]);

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) => propertyService.updateProperty(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['property', id] });
            queryClient.invalidateQueries({ queryKey: ['my-properties'] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            Alert.alert('Succès', 'Annonce mise à jour.', [{ text: 'OK', onPress: () => router.back() }]);
        },
        onError: (e: Error) => Alert.alert('Erreur', e.message),
    });

    const handleSave = () => {
        if (!title.trim() || !priceGNF || !quartier.trim()) {
            Alert.alert('Champs requis', 'Titre, prix et quartier sont obligatoires.');
            return;
        }
        mutation.mutate({
            title: title.trim(),
            description: description.trim(),
            price_gnf: parseInt(priceGNF, 10),
            quartier: quartier.trim(),
            commune,
            type,
            furnished,
            bedrooms: parseInt(bedrooms, 10),
            bathrooms: parseInt(bathrooms, 10),
        });
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Modifier l'annonce</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAwareScrollViewCompat
                contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {renderInput('Titre *', title, setTitle, 'Ex: Appartement moderne Kipé', colors)}
                {renderInput('Quartier *', quartier, setQuartier, 'Ex: Kipé', colors)}
                {renderInput('Prix (GNF/mois) *', priceGNF, setPriceGNF, 'Ex: 2000000', colors, 'numeric')}
                {renderInput('Description', description, setDescription, 'Décrivez le bien...', colors, 'default', true)}

                <Text style={[styles.label, { color: colors.textSecondary }]}>Commune</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {COMMUNES.map(c => (
                        <FilterChip key={c} label={c} active={commune === c} onPress={() => setCommune(c)} />
                    ))}
                </ScrollView>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Type de bien</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {PROPERTY_TYPES.map(t => (
                        <FilterChip key={t} label={t} active={type === t} onPress={() => setType(t)} />
                    ))}
                </ScrollView>

                <Text style={[styles.label, { color: colors.textSecondary }]}>Meublé</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {(['Meublé', 'Semi-meublé', 'Vide'] as FurnishedType[]).map(f => (
                        <FilterChip key={f} label={f} active={furnished === f} onPress={() => setFurnished(f)} />
                    ))}
                </ScrollView>

                <View style={styles.row}>
                    {renderInput('Chambres', bedrooms, setBedrooms, '1', colors, 'numeric')}
                    {renderInput('S. de bain', bathrooms, setBathrooms, '1', colors, 'numeric')}
                </View>

                <Pressable
                    onPress={handleSave}
                    disabled={mutation.isPending}
                    style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: mutation.isPending ? 0.7 : 1 }]}
                >
                    {mutation.isPending
                        ? <ActivityIndicator color="#0D0D0D" />
                        : <Text style={styles.saveBtnText}>Enregistrer les modifications</Text>}
                </Pressable>
            </KeyboardAwareScrollViewCompat>
        </View>
    );
}

function renderInput(
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder: string,
    colors: any,
    keyboardType: 'default' | 'numeric' = 'default',
    multiline = false,
) {
    return (
        <View style={styles.inputGroup} key={label}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType}
                multiline={multiline}
                style={[
                    styles.input,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                    multiline && { height: 100, textAlignVertical: 'top' },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    body: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    row: { flexDirection: 'row', gap: 12 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    input: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 15 },
    chips: { gap: 8, paddingBottom: 16 },
    saveBtn: { height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#0D0D0D' },
});
