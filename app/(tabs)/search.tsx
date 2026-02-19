import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';
import PropertyCard from '@/components/PropertyCard';
import FilterChip from '@/components/FilterChip';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { filteredProperties, searchQuery, setSearchQuery, activeFiltersCount, filters, setFilters } = useApp();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const handleSearch = (text: string) => {
    setLocalQuery(text);
    setSearchQuery(text);
  };

  const openFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/filters');
  };

  const removeCommune = (c: string) => {
    setFilters({ ...filters, communes: filters.communes.filter(x => x !== c) });
  };

  const removeType = (t: string) => {
    setFilters({ ...filters, types: filters.types.filter(x => x !== t) });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={localQuery}
              onChangeText={handleSearch}
              placeholder="Commune, quartier, type..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.textPrimary }]}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {localQuery.length > 0 && (
              <Pressable onPress={() => handleSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          <Pressable onPress={openFilters} style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}>
            <Ionicons name="options" size={20} color={activeFiltersCount > 0 ? '#0D0D0D' : colors.textPrimary} />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {(filters.communes.length > 0 || filters.types.length > 0) && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.activeFilters}>
            {filters.communes.map(c => (
              <FilterChip key={c} label={c} active onPress={() => removeCommune(c)} />
            ))}
            {filters.types.map(t => (
              <FilterChip key={t} label={t} active onPress={() => removeType(t)} />
            ))}
          </Animated.View>
        )}

        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filteredProperties.length} bien{filteredProperties.length !== 1 ? 's' : ''} trouvé{filteredProperties.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredProperties}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <PropertyCard property={item} variant="horizontal" index={index} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun résultat</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Essayez de modifier vos filtres ou votre recherche
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  filterBtnActive: { backgroundColor: '#B8F53A' },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' as const },
  activeFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  resultCount: { fontSize: 13, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
