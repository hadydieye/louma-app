import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { useAuth } from '@/lib/AuthContext';
import { useApp } from '@/lib/store';
import { PROPERTY_TYPES, PropertyType } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import FilterChip from '@/components/FilterChip';
import { propertyService } from '@/services/propertyService';
import { leadService } from '@/services/leadService';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { properties, setSearchQuery, isLoading } = useApp();
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);

  const isOwner = user?.role === 'OWNER' || user?.role === 'AGENCY';

  const { data: myProperties } = useQuery({
    queryKey: ['properties', 'mine'],
    queryFn: () => propertyService.getMyProperties(),
    enabled: !!user && isOwner,
  });

  const { data: receivedLeads } = useQuery({
    queryKey: ['leads', 'received'],
    queryFn: () => leadService.getForOwner(),
    enabled: !!user && isOwner,
  });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const popular = properties.filter(p => p.viewCount > 15).slice(0, 5);
  const nearby = properties.slice(0, 4);
  const typeFiltered = selectedType ? properties.filter(p => p.type === selectedType) : null;

  const activePropertiesCount = myProperties?.filter((p: any) => p.is_active).length || 0;
  const newLeadsCount = receivedLeads?.filter((l: any) => l.status === 'NEW').length || 0;

  const handleSearch = () => {
    router.push('/(tabs)/search');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Chargement...</Text>
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
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  {user ? `Bonjour, ${user.fullName.split(' ')[0]}` : 'Bienvenue sur'}
                </Text>
                <Text style={[styles.appName, { color: colors.textPrimary }]}>LOUMA</Text>
              </View>
              <Pressable
                onPress={() => { }}
                style={[styles.notifBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
                {newLeadsCount > 0 && <View style={[styles.notifBadge, { backgroundColor: colors.danger }]} />}
              </Pressable>
            </View>

            {isOwner ? (
              <View style={styles.ownerDashboard}>
                <Text style={[styles.heroTitle, { color: colors.textPrimary, marginBottom: 16 }]}>
                  Tableau de bord{'\n'}Propriétaire
                </Text>
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{activePropertiesCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Annonces en ligne</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.statValue, { color: colors.danger }]}>{newLeadsCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Nouveaux Leads</Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
                  Trouvez votre{'\n'}logement idéal
                </Text>

                <Pressable onPress={handleSearch} style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Ionicons name="search" size={18} color={colors.textMuted} />
                  <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>Commune, quartier, type...</Text>
                </Pressable>
              </>
            )}
          </Animated.View>

          {isOwner ? (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Demandes récentes</Text>
                <Pressable onPress={() => router.push('/(tabs)/leads')}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>Voir tout</Text>
                </Pressable>
              </View>
              {receivedLeads && receivedLeads.length > 0 ? (
                <View style={styles.verticalList}>
                  {receivedLeads.slice(0, 3).map((lead: any, i: number) => (
                    <Pressable
                      key={lead.id}
                      style={[styles.leadListItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => router.push('/(tabs)/leads')}
                    >
                      <View style={styles.leadListInfo}>
                        <Text style={[styles.leadListName, { color: colors.textPrimary }]}>{lead.user?.full_name}</Text>
                        <Text style={[styles.leadListProp, { color: colors.textSecondary }]}>{lead.property?.title}</Text>
                      </View>
                      <View style={[styles.statusMini, { backgroundColor: lead.status === 'NEW' ? 'rgba(52,199,89,0.15)' : 'rgba(0,122,255,0.15)' }]}>
                        <Text style={[styles.statusMiniText, { color: lead.status === 'NEW' ? '#34C759' : '#007AFF' }]}>{lead.status}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyRecent}>
                  <Text style={{ color: colors.textMuted }}>Aucune demande reçue pour le moment.</Text>
                </View>
              )}

              <View style={[styles.section, { marginTop: 24 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vos annonces</Text>
                  <Pressable onPress={() => router.push('/(tabs)/my-properties')}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>Gérer</Text>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
                  {myProperties && myProperties.length > 0 ? (
                    myProperties.map((p: any, i: number) => (
                      <PropertyCard key={p.id} property={p} variant="vertical" index={i} />
                    ))
                  ) : (
                    <TouchableOpacity 
                      style={[styles.addFirstCard, { borderColor: colors.border, borderStyle: 'dashed', borderWidth: 2 }]}
                      onPress={() => router.push('/property/create')}
                    >
                      <Ionicons name="add" size={32} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, marginTop: 8 }}>Publier votre premier bien</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </Animated.View>
          ) : (
            <>
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
            </>
          )}
        </View>
      </ScrollView>

      {isAuthenticated && (user?.role === 'OWNER' || user?.role === 'AGENCY') && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/property/create')}
        >
          <Ionicons name="add" size={24} color="#0D0D0D" />
          <Text style={styles.fabText}>Ajouter un bien</Text>
        </Pressable>
      )}
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
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  ownerDashboard: { marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  statValue: { fontSize: 24, fontWeight: '900' as const, marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600' as const },
  leadListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  leadListInfo: { flex: 1 },
  leadListName: { fontSize: 15, fontWeight: '700' as const },
  leadListProp: { fontSize: 13, marginTop: 2 },
  statusMini: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusMiniText: { fontSize: 10, fontWeight: '800' as const },
  emptyRecent: { padding: 20, alignItems: 'center', opacity: 0.6 },
  addFirstCard: { 
    width: 160, 
    height: 220, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16,
    padding: 20,
    textAlign: 'center'
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
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 100 : 90,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    color: '#0D0D0D',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
