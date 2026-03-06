import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, Switch, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/lib/useTheme';
import { useAuth } from '@/lib/AuthContext';
import { propertyService } from '@/services/propertyService';
import { COMMUNES, PROPERTY_TYPES, PropertyType, Commune, FurnishedType, WaterSupply, ElectricityType } from '@/lib/types';
import FilterChip from '@/components/FilterChip';

export default function CreatePropertyScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const { user, isAuthenticated } = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    // Base Information
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<PropertyType>('Appartement');

    // Location
    const [commune, setCommune] = useState<Commune>('Ratoma');
    const [quartier, setQuartier] = useState('');
    const [repere, setRepere] = useState('');

    // Specs
    const [priceGNF, setPriceGNF] = useState('');
    const [surfaceM2, setSurfaceM2] = useState('');
    const [totalRooms, setTotalRooms] = useState('1');
    const [bedrooms, setBedrooms] = useState('1');
    const [bathrooms, setBathrooms] = useState('1');

    // Status & Types
    const [furnished, setFurnished] = useState<FurnishedType>('Vide');
    const [condition, setCondition] = useState<'Neuf' | 'Bon état' | 'À rénover'>('Bon état');
    const [waterSupply, setWaterSupply] = useState<WaterSupply>('SEEG fiable');
    const [electricityType, setElectricityType] = useState<ElectricityType>('EDG fiable');

    // Booleans
    const [hasGenerator, setHasGenerator] = useState(false);
    const [generatorIncluded, setGeneratorIncluded] = useState(false);
    const [hasAC, setHasAC] = useState(false);
    const [hasParking, setHasParking] = useState(false);
    const [hasSecurity, setHasSecurity] = useState(false);
    const [hasInternet, setHasInternet] = useState(false);
    const [hasHotWater, setHasHotWater] = useState(false);
    const [accessibleInRain, setAccessibleInRain] = useState(false);

    // Leasing info
    const [depositMonths, setDepositMonths] = useState('3');
    const [advanceMonths, setAdvanceMonths] = useState('3');
    const [minDurationMonths, setMinDurationMonths] = useState('6');

    if (!isAuthenticated || (user?.role !== 'OWNER' && user?.role !== 'AGENCY')) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
                <Text style={{ color: colors.textPrimary, marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>Accès Refusé</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
                    Seuls les propriétaires et agences peuvent ajouter un bien.
                </Text>
                <Pressable onPress={() => router.back()} style={[styles.submitBtn, { backgroundColor: colors.primary, marginTop: 24, paddingHorizontal: 24 }]}>
                    <Text style={styles.submitText}>Retour</Text>
                </Pressable>
            </View>
        );
    }

    const handleSubmit = async () => {
        if (!title || !priceGNF || !quartier) {
            Alert.alert("Erreur", "Veuillez remplir les champs obligatoires (Titre, Prix, Quartier).");
            return;
        }

        try {
            setIsLoading(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const payload = {
                title,
                description,
                type,
                commune,
                quartier,
                repere,
                price_gnf: parseInt(priceGNF, 10),
                surface_m2: surfaceM2 ? parseInt(surfaceM2, 10) : null,
                total_rooms: parseInt(totalRooms, 10),
                bedrooms: parseInt(bedrooms, 10),
                bathrooms: parseInt(bathrooms, 10),
                furnished,
                condition,
                water_supply: waterSupply,
                electricity_type: electricityType,
                has_generator: hasGenerator,
                generator_included: generatorIncluded,
                has_ac: hasAC,
                has_parking: hasParking,
                has_security: hasSecurity,
                has_internet: hasInternet,
                has_hot_water: hasHotWater,
                accessible_in_rain: accessibleInRain,
                deposit_months: parseInt(depositMonths, 10),
                advance_months: parseInt(advanceMonths, 10),
                min_duration_months: parseInt(minDurationMonths, 10),
                available_from: new Date().toISOString(),
                is_active: true,
                is_available: true
            };

            const newProperty = await propertyService.createProperty(payload);
            Alert.alert("Succès", "Le bien a été ajouté avec succès !", [
                { text: "OK", onPress: () => router.replace('/(tabs)/index' as any) }
            ]);
        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Impossible d'ajouter le bien.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderSectionHeader = (title: string) => (
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    );

    const renderInput = (label: string, value: string, setter: (val: string) => void, placeholder: string, keyboardType: 'default' | 'numeric' = 'default', multiline = false) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary },
                    multiline && { height: 100, textAlignVertical: 'top' }
                ]}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );

    const renderChipsHorizontal = <T extends string>(label: string, options: readonly T[], selected: T, setter: (val: T) => void) => (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {options.map(opt => (
                    <FilterChip key={opt} label={opt} active={selected === opt} onPress={() => setter(opt as any)} />
                ))}
            </ScrollView>
        </View>
    );

    const renderToggle = (label: string, value: boolean, setter: (val: boolean) => void) => (
        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{label}</Text>
            <Switch
                value={value}
                onValueChange={setter}
                trackColor={{ false: colors.border, true: 'rgba(184,245,58,0.4)' }}
                thumbColor={value ? '#B8F53A' : '#ccc'}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top || 16, borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ajouter un bien</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {renderSectionHeader("Informations Générales")}
                {renderInput("Titre de l'annonce *", title, setTitle, "Ex: Bel appartement 3 pièces...")}
                {renderInput("Description", description, setDescription, "Détaillez les atouts du bien...", "default", true)}
                {renderChipsHorizontal("Type de bien", PROPERTY_TYPES, type, setType)}

                {renderSectionHeader("Localisation")}
                {renderChipsHorizontal("Commune", COMMUNES, commune, setCommune)}
                {renderInput("Quartier *", quartier, setQuartier, "Ex: Kipé")}
                {renderInput("Repère (optionnel)", repere, setRepere, "Ex: Près de la pharmacie...")}

                {renderSectionHeader("Tarification")}
                {renderInput("Prix Mensuel (GNF) *", priceGNF, setPriceGNF, "Ex: 2500000", "numeric")}
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>{renderInput("Avance (mois)", advanceMonths, setAdvanceMonths, "3", "numeric")}</View>
                    <View style={{ width: 16 }} />
                    <View style={{ flex: 1 }}>{renderInput("Caution (mois)", depositMonths, setDepositMonths, "3", "numeric")}</View>
                </View>

                {renderSectionHeader("Dimensions & Pièces")}
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>{renderInput("Surface (m²)", surfaceM2, setSurfaceM2, "Ex: 120", "numeric")}</View>
                    <View style={{ width: 16 }} />
                    <View style={{ flex: 1 }}>{renderInput("Nb Total de pièces", totalRooms, setTotalRooms, "Ex: 4", "numeric")}</View>
                </View>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>{renderInput("Chambres", bedrooms, setBedrooms, "1", "numeric")}</View>
                    <View style={{ width: 16 }} />
                    <View style={{ flex: 1 }}>{renderInput("Salles de bain", bathrooms, setBathrooms, "1", "numeric")}</View>
                </View>

                {renderSectionHeader("État & Installations")}
                {renderChipsHorizontal("Ameublement", ['Meublé', 'Semi-meublé', 'Vide'], furnished, setFurnished)}
                {renderChipsHorizontal("État", ['Neuf', 'Bon état', 'À rénover'], condition, setCondition)}
                {renderChipsHorizontal("Approvisionnement Eau", ['SEEG fiable', 'SEEG intermittente', 'Puits', 'Citerne'], waterSupply, setWaterSupply)}
                {renderChipsHorizontal("Type d'électricité", ['EDG fiable', 'EDG intermittente', 'Groupe seul', 'Solaire'], electricityType, setElectricityType)}

                {renderSectionHeader("Équipements & Options")}
                {renderToggle("Groupe électrogène", hasGenerator, setHasGenerator)}
                {hasGenerator && renderToggle("Carburant groupe inclus", generatorIncluded, setGeneratorIncluded)}
                {renderToggle("Climatisation", hasAC, setHasAC)}
                {renderToggle("Parking", hasParking, setHasParking)}
                {renderToggle("Service de sécurité", hasSecurity, setHasSecurity)}
                {renderToggle("Internet / Fibre", hasInternet, setHasInternet)}
                {renderToggle("Eau chaude", hasHotWater, setHasHotWater)}
                {renderToggle("Accessible en saison des pluies", accessibleInRain, setAccessibleInRain)}

                <Pressable
                    style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="#0D0D0D" /> : <Text style={styles.submitText}>Publier l'annonce</Text>}
                </Pressable>

            </ScrollView>
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
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4, marginLeft: -4 },
    headerTitle: { fontSize: 18, fontWeight: '700' as const },
    formContainer: { flex: 1, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '800' as const, marginTop: 32, marginBottom: 16 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8, textTransform: 'uppercase' },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
    },
    row: { flexDirection: 'row' },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
    },
    toggleLabel: { fontSize: 15, fontWeight: '500' as const },
    submitBtn: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginVertical: 40,
    },
    submitText: { fontSize: 16, fontWeight: 'bold' as const, color: '#0D0D0D' },
});
