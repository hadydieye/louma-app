import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';
import { useAuth } from '@/lib/AuthContext';
import { propertiesApi } from '@/lib/api';
import { formatPrice, formatGNF, Property } from '@/lib/types';
import EquipmentIcon from '@/components/EquipmentIcon';
import LeadSubmissionModal from '@/components/LeadSubmissionModal';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isFavorite, toggleFavorite } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const topInset = Platform.OS === 'web' ? 20 : insets.top;

  const { data: propertyResponse, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getById(id),
    enabled: !!id,
  });

  const property = propertyResponse?.data as Property | undefined;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Chargement des détails...</Text>
      </View>
    );
  }

  if (!property || error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Bien introuvable</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const fav = isFavorite(property.id);

  const totalCost = useMemo(() => {
    const loyer = property.priceGNF;
    const caution = loyer * property.depositMonths;
    const avance = loyer * property.advanceMonths;
    return { loyer, caution, avance, total: loyer + caution + avance };
  }, [property]);

  const handleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(property.id);
  };

  const handleInterest = () => {
    if (!isAuthenticated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/auth');
      return;
    }

    if (user?.id === property.ownerId) {
      alert("Vous ne pouvez pas envoyer de demande pour votre propre bien.");
      return;
    }

    setShowLeadModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LeadSubmissionModal
        visible={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        priceGNF={property.priceGNF}
      />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {property.images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.heroImage} contentFit="cover" transition={200} />
            ))}
          </ScrollView>
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.5)']}
            style={StyleSheet.absoluteFill}
            locations={[0, 0.25, 0.6, 1]}
          />

          <View style={[styles.topBar, { top: topInset + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.glassCircle}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <View style={styles.topRight}>
              <Pressable onPress={handleFav} style={styles.glassCircle}>
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#FF4444' : '#FFF'} />
              </Pressable>
              <Pressable style={styles.glassCircle}>
                <Ionicons name="share-outline" size={20} color="#FFF" />
              </Pressable>
            </View>
          </View>

          {property.images.length > 1 && (
            <View style={styles.dots}>
              {property.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={[styles.contentPanel, { backgroundColor: colors.background }]}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.propertyTitle, { color: colors.textPrimary }]}>{property.title}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={colors.primary} />
                  <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                    {property.commune}, {property.quartier}
                  </Text>
                </View>
              </View>
              {property.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#0D0D0D" />
                  <Text style={styles.verifiedText}>Vérifié Louma</Text>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.textPrimary }]}>{formatPrice(property)}</Text>
              <Text style={[styles.perMonth, { color: colors.textMuted }]}>/mois</Text>
            </View>
            {property.chargesIncluded && (
              <Text style={[styles.chargesText, { color: colors.primary }]}>Charges incluses</Text>
            )}
            {property.negotiable && (
              <View style={styles.negotiableBadge}>
                <Text style={styles.negotiableText}>Négociable</Text>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250)}>
            <Pressable onPress={() => setShowCalc(!showCalc)} style={[styles.calcToggle, { borderColor: colors.border }]}>
              <Ionicons name="calculator-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.calcLabel, { color: colors.textPrimary }]}>Calcul du coût total d'entrée</Text>
              <Ionicons name={showCalc ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
            </Pressable>
            {showCalc && (
              <View style={[styles.calcContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcItem, { color: colors.textSecondary }]}>Loyer</Text>
                  <Text style={[styles.calcValue, { color: colors.textPrimary }]}>{formatGNF(totalCost.loyer)}</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcItem, { color: colors.textSecondary }]}>Caution ({property.depositMonths} mois)</Text>
                  <Text style={[styles.calcValue, { color: colors.textPrimary }]}>{formatGNF(totalCost.caution)}</Text>
                </View>
                <View style={styles.calcRow}>
                  <Text style={[styles.calcItem, { color: colors.textSecondary }]}>Avance ({property.advanceMonths} mois)</Text>
                  <Text style={[styles.calcValue, { color: colors.textPrimary }]}>{formatGNF(totalCost.avance)}</Text>
                </View>
                <View style={[styles.calcRow, styles.calcTotal]}>
                  <Text style={[styles.calcTotalLabel, { color: colors.textPrimary }]}>TOTAL</Text>
                  <Text style={[styles.calcTotalValue, { color: colors.primary }]}>{formatGNF(totalCost.total)}</Text>
                </View>
              </View>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.detailsGrid}>
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="bed-outline" size={20} color={colors.primary} />
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{property.bedrooms}</Text>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Chambres</Text>
            </View>
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="shower" size={20} color={colors.primary} />
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{property.bathrooms}</Text>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>S. de bain</Text>
            </View>
            {property.surfaceM2 && (
              <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <MaterialCommunityIcons name="ruler-square" size={20} color={colors.primary} />
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{property.surfaceM2}</Text>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>m²</Text>
              </View>
            )}
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="sofa" size={20} color={colors.primary} />
              <Text style={[styles.detailValue, { color: colors.textPrimary, fontSize: 12 }]}>{property.furnished}</Text>
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Meublé</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(350)}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Équipements</Text>
            <View style={styles.equipmentGrid}>
              <EquipmentIcon type="water" available={property.waterSupply === 'SEEG fiable'} detail={property.waterSupply} />
              <EquipmentIcon type="electricity" available={property.electricityType === 'EDG fiable'} detail={property.electricityType} />
              <EquipmentIcon type="generator" available={property.hasGenerator} detail={property.generatorIncluded ? 'Inclus' : undefined} />
              <EquipmentIcon type="ac" available={property.hasAC} detail={property.acCount ? `${property.acCount} splits` : undefined} />
              <EquipmentIcon type="parking" available={property.hasParking} />
              <EquipmentIcon type="security" available={property.hasSecurity} />
              <EquipmentIcon type="internet" available={property.hasInternet} />
              <EquipmentIcon type="hotwater" available={property.hasHotWater} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Description</Text>
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={showFullDesc ? undefined : 3}
            >
              {property.description}
            </Text>
            {property.description.length > 120 && (
              <Pressable onPress={() => setShowFullDesc(!showFullDesc)}>
                <Text style={[styles.readMore, { color: colors.primary }]}>
                  {showFullDesc ? 'Voir moins' : 'Lire plus'}
                </Text>
              </Pressable>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(450)}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Restrictions</Text>
            <View style={styles.restrictionsList}>
              <View style={styles.restrictionRow}>
                <Ionicons name={property.petsAllowed ? 'checkmark-circle' : 'close-circle'} size={18} color={property.petsAllowed ? '#B8F53A' : '#FF4444'} />
                <Text style={[styles.restrictionText, { color: colors.textSecondary }]}>
                  Animaux {property.petsAllowed ? 'acceptés' : 'non acceptés'}
                </Text>
              </View>
              <View style={styles.restrictionRow}>
                <Ionicons name={property.smokingAllowed ? 'checkmark-circle' : 'close-circle'} size={18} color={property.smokingAllowed ? '#B8F53A' : '#FF4444'} />
                <Text style={[styles.restrictionText, { color: colors.textSecondary }]}>
                  Fumeurs {property.smokingAllowed ? 'acceptés' : 'non acceptés'}
                </Text>
              </View>
              {property.maxOccupants && (
                <View style={styles.restrictionRow}>
                  <Ionicons name="people" size={18} color={colors.textMuted} />
                  <Text style={[styles.restrictionText, { color: colors.textSecondary }]}>
                    Maximum {property.maxOccupants} occupants
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Propriétaire</Text>
            <View style={[styles.ownerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitials}>{property.ownerName.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ownerName, { color: colors.textPrimary }]}>{property.ownerName}</Text>
                <Text style={[styles.ownerRole, { color: colors.textMuted }]}>Propriétaire</Text>
              </View>
            </View>
          </Animated.View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 8 }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={[styles.bottomPrice, { color: colors.textPrimary }]}>{formatPrice(property)}</Text>
          <Text style={[styles.bottomPerMonth, { color: colors.textMuted }]}>/mois</Text>
        </View>
        <Pressable
          onPress={handleInterest}
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.ctaText}>Je suis intéressé(e)</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { width, height: HERO_HEIGHT },
  heroImage: { width, height: HERO_HEIGHT },
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  topRight: { flexDirection: 'row', gap: 10 },
  glassCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { position: 'absolute', bottom: 24, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#FFF', width: 16 },
  contentPanel: { marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 28 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  propertyTitle: { fontSize: 22, fontWeight: '800' as const, lineHeight: 28 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  locationText: { fontSize: 14 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8F53A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    marginLeft: 8,
  },
  verifiedText: { fontSize: 11, fontWeight: '700' as const, color: '#0D0D0D' },
  priceSection: { marginTop: 16, marginBottom: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  price: { fontSize: 26, fontWeight: '900' as const },
  perMonth: { fontSize: 14 },
  chargesText: { fontSize: 12, fontWeight: '600' as const, marginTop: 4 },
  negotiableBadge: { backgroundColor: 'rgba(255,149,0,0.12)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', marginTop: 6 },
  negotiableText: { color: '#FF9500', fontSize: 11, fontWeight: '600' as const },
  calcToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    marginBottom: 4,
  },
  calcLabel: { flex: 1, fontSize: 14, fontWeight: '600' as const },
  calcContent: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  calcItem: { fontSize: 13 },
  calcValue: { fontSize: 13, fontWeight: '600' as const },
  calcTotal: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', marginTop: 4, paddingTop: 12 },
  calcTotalLabel: { fontSize: 14, fontWeight: '800' as const },
  calcTotalValue: { fontSize: 16, fontWeight: '900' as const },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 20 },
  detailCard: { flex: 1, minWidth: 70, alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, gap: 4 },
  detailValue: { fontSize: 16, fontWeight: '800' as const },
  detailLabel: { fontSize: 10, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800' as const, marginBottom: 14, marginTop: 8 },
  equipmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-start' },
  description: { fontSize: 14, lineHeight: 22 },
  readMore: { fontSize: 13, fontWeight: '600' as const, marginTop: 6 },
  restrictionsList: { gap: 10 },
  restrictionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restrictionText: { fontSize: 14 },
  ownerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(184,245,58,0.15)', alignItems: 'center', justifyContent: 'center' },
  ownerInitials: { fontSize: 16, fontWeight: '700' as const, color: '#B8F53A' },
  ownerName: { fontSize: 15, fontWeight: '700' as const },
  ownerRole: { fontSize: 12, marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bottomPriceCol: { flex: 1 },
  bottomPrice: { fontSize: 18, fontWeight: '800' as const },
  bottomPerMonth: { fontSize: 12 },
  ctaBtn: {
    backgroundColor: '#B8F53A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaText: { fontSize: 14, fontWeight: '700' as const, color: '#0D0D0D' },
});
