import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';
import { FilterState, COMMUNES, PROPERTY_TYPES, Commune, PropertyType, FurnishedType } from '@/lib/types';
import FilterChip from './FilterChip';
import { router } from 'expo-router';

export default function FilterSheet() {
  const { colors } = useTheme();
  const { filters, setFilters, resetFilters, filteredProperties } = useApp();
  const [local, setLocal] = useState<FilterState>({ ...filters });

  const toggleCommune = (c: Commune) => {
    setLocal(prev => ({
      ...prev,
      communes: prev.communes.includes(c)
        ? prev.communes.filter(x => x !== c)
        : [...prev.communes, c],
    }));
  };

  const toggleType = (t: PropertyType) => {
    setLocal(prev => ({
      ...prev,
      types: prev.types.includes(t)
        ? prev.types.filter(x => x !== t)
        : [...prev.types, t],
    }));
  };

  const setFurnished = (f: FurnishedType | undefined) => {
    setLocal(prev => ({ ...prev, furnished: prev.furnished === f ? undefined : f }));
  };

  const toggleBool = (key: keyof FilterState) => {
    setLocal(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setBedrooms = (n: number | undefined) => {
    setLocal(prev => ({ ...prev, bedrooms: prev.bedrooms === n ? undefined : n }));
  };

  const apply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFilters(local);
    router.back();
  };

  const reset = () => {
    setLocal({
      communes: [],
      types: [],
      currency: 'GNF',
      waterReliable: false,
      electricityReliable: false,
      generatorIncluded: false,
      accessibleInRain: false,
      verifiedOnly: false,
      availableNow: false,
    });
  };

  const countFilters = () => {
    let c = 0;
    if (local.communes.length) c++;
    if (local.types.length) c++;
    if (local.bedrooms !== undefined) c++;
    if (local.furnished !== undefined) c++;
    if (local.waterReliable) c++;
    if (local.electricityReliable) c++;
    if (local.generatorIncluded) c++;
    if (local.accessibleInRain) c++;
    if (local.verifiedOnly) c++;
    if (local.availableNow) c++;
    return c;
  };

  const renderToggle = (label: string, key: keyof FilterState, icon: string) => (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={styles.toggleLeft}>
        <Ionicons name={icon as any} size={18} color={local[key] ? '#B8F53A' : colors.textMuted} />
        <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{label}</Text>
      </View>
      <Switch
        value={local[key] as boolean}
        onValueChange={() => toggleBool(key)}
        trackColor={{ false: colors.border, true: 'rgba(184,245,58,0.4)' }}
        thumbColor={local[key] ? '#B8F53A' : '#ccc'}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Filtres</Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Commune</Text>
        <View style={styles.chipRow}>
          {COMMUNES.map(c => (
            <FilterChip key={c} label={c} active={local.communes.includes(c)} onPress={() => toggleCommune(c)} />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Type de bien</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PROPERTY_TYPES.map(t => (
            <FilterChip key={t} label={t} active={local.types.includes(t)} onPress={() => toggleType(t)} />
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Chambres</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <FilterChip key={n} label={n === 5 ? '5+' : `${n}`} active={local.bedrooms === n} onPress={() => setBedrooms(n)} />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meublé</Text>
        <View style={styles.chipRow}>
          {(['Meublé', 'Semi-meublé', 'Vide'] as FurnishedType[]).map(f => (
            <FilterChip key={f} label={f} active={local.furnished === f} onPress={() => setFurnished(f)} />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Critères Guinée</Text>
        {renderToggle('Eau fiable', 'waterReliable', 'water')}
        {renderToggle('Électricité fiable', 'electricityReliable', 'flash')}
        {renderToggle('Groupe électrogène inclus', 'generatorIncluded', 'construct')}
        {renderToggle('Accès saison des pluies', 'accessibleInRain', 'rainy')}

        <View style={styles.divider} />

        {renderToggle('Biens vérifiés uniquement', 'verifiedOnly', 'checkmark-circle')}
        {renderToggle('Disponible immédiatement', 'availableNow', 'time')}

        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Pressable onPress={reset} style={styles.resetBtn}>
          <Text style={[styles.resetText, { color: colors.textSecondary }]}>Réinitialiser</Text>
        </Pressable>
        <Pressable onPress={apply} style={styles.applyBtn}>
          <Text style={styles.applyText}>
            Appliquer{countFilters() > 0 ? ` (${countFilters()})` : ''}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' as const },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 12, marginTop: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '500' as const },
  divider: { height: 16 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'web' ? 50 : 32,
    gap: 12,
    borderTopWidth: 1,
  },
  resetBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontSize: 15, fontWeight: '600' as const },
  applyBtn: {
    flex: 2,
    backgroundColor: '#B8F53A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  applyText: { fontSize: 15, fontWeight: '700' as const, color: '#0D0D0D' },
});
