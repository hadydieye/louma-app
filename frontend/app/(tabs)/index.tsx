import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';
import { PROPERTY_TYPES, PropertyType } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import FilterChip from '@/components/FilterChip';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { properties, setSearchQuery, isLoading } = useApp();
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const popular = properties.filter(p => p.viewCount > 15).slice(0, 5); // Lowered threshold for dev
  const nearby = properties.slice(0, 4);
  const typeFiltered = selectedType ? properties.filter(p => p.type === selectedType) : null;

  const handleSearch = () => {
    router.push('/(tabs)/search');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Chargement des propriétés...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ paddingTop: topInset + 8 }}>
          <Animated.View entering={FadeInDown.delay(100)} style={styles.headerSection}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Bienvenue sur</Text>
                <Text style={[styles.appName, { color: colors.textPrimary }]}>LOUMA</Text>
              </View>
              <Pressable
                onPress={() => { }}
                style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              Trouvez votre{'\n'}logement idéal
            </Text>

            <Pressable onPress={handleSearch} style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>Commune, quartier, type...</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              <FilterChip
                label="Tous"
                active={selectedType === null}
                onPress={() => setSelectedType(null)}
              />
              {PROPERTY_TYPES.map(t => (
                <FilterChip
                  key={t}
                  label={t}
                  active={selectedType === t}
                  onPress={() => setSelectedType(selectedType === t ? null : t)}
                />
              ))}
            </ScrollView>
          </Animated.View>

          {properties.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Ionicons name="home-outline" size={48} color={colors.textMuted} style={{ marginBottom: 16 }} />
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Aucune propriété disponible pour le moment.
              </Text>
            </View>
          ) : (
            <>
              {typeFiltered && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{selectedType}</Text>
                    <Text style={[styles.resultCount, { color: colors.textMuted }]}>{typeFiltered.length} biens</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
                    {typeFiltered.map((p, i) => (
                      <PropertyCard key={p.id} property={p} variant="vertical" index={i} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {!typeFiltered && (
                <>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Biens populaires</Text>
                      <Pressable onPress={() => router.push('/(tabs)/search')}>
                        <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
                      </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
                      {popular.length > 0 ? (
                        popular.map((p, i) => (
                          <PropertyCard key={p.id} property={p} variant="vertical" index={i} />
                        ))
                      ) : (
                        <Text style={{ color: colors.textMuted, marginLeft: 20 }}>Pas encore de biens populaires</Text>
                      )}
                    </ScrollView>
                  </View>

                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Près de vous</Text>
                      <Pressable onPress={() => router.push('/(tabs)/search')}>
                        <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
                      </Pressable>
                    </View>
                    <View style={styles.verticalList}>
                      {nearby.map((p, i) => (
                        <PropertyCard key={p.id} property={p} variant="horizontal" index={i} />
                      ))}
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { paddingHorizontal: 20, marginBottom: 8 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, fontWeight: '500' as const },
  appName: { fontSize: 28, fontWeight: '900' as const, letterSpacing: 1 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroTitle: { fontSize: 30, fontWeight: '800' as const, lineHeight: 38, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  searchPlaceholder: { fontSize: 14, flex: 1 },
  chipScroll: { paddingHorizontal: 20, paddingVertical: 12 },
  section: { marginTop: 8, marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800' as const },
  resultCount: { fontSize: 13 },
  seeAll: { fontSize: 14, fontWeight: '600' as const },
  cardScroll: { paddingLeft: 20, paddingRight: 4 },
  verticalList: { paddingHorizontal: 20 },
});
