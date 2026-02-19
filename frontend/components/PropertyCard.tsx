import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';
import { Property, formatPrice } from '@/lib/types';
import { useApp } from '@/lib/store';
import { router } from 'expo-router';

interface Props {
  property: Property;
  variant?: 'vertical' | 'horizontal';
  index?: number;
}

export default function PropertyCard({ property, variant = 'vertical', index = 0 }: Props) {
  const { colors, borderRadius: br } = useTheme();
  const { isFavorite, toggleFavorite } = useApp();
  const scale = useSharedValue(1);
  const fav = isFavorite(property.id);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => { scale.value = withSpring(0.97); };
  const onPressOut = () => { scale.value = withSpring(1); };

  const handleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(property.id);
  };

  const handlePress = () => {
    router.push({ pathname: '/property/[id]', params: { id: property.id } });
  };

  if (variant === 'horizontal') {
    return (
      <Animated.View entering={FadeInUp.delay(index * 80).springify()}>
        <Pressable
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View style={[styles.hCard, { backgroundColor: colors.surface, borderColor: colors.border }, animatedStyle]}>
            <View style={styles.hImageWrap}>
              <Image source={{ uri: property.images[0] }} style={styles.hImage} contentFit="cover" transition={300} />
              {property.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#0D0D0D" />
                  <Text style={styles.verifiedText}>Vérifié</Text>
                </View>
              )}
            </View>
            <View style={styles.hContent}>
              <Text style={[styles.hTitle, { color: colors.textPrimary }]} numberOfLines={1}>{property.title}</Text>
              <View style={styles.hLocationRow}>
                <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                <Text style={[styles.hLocation, { color: colors.textSecondary }]} numberOfLines={1}>{property.commune}, {property.quartier}</Text>
              </View>
              <View style={styles.hDetailsRow}>
                <View style={styles.hDetailItem}>
                  <Ionicons name="bed-outline" size={14} color={colors.textMuted} />
                  <Text style={[styles.hDetailText, { color: colors.textMuted }]}>{property.bedrooms}</Text>
                </View>
                <View style={styles.hDetailItem}>
                  <MaterialCommunityIcons name="shower" size={14} color={colors.textMuted} />
                  <Text style={[styles.hDetailText, { color: colors.textMuted }]}>{property.bathrooms}</Text>
                </View>
                {property.surfaceM2 && (
                  <View style={styles.hDetailItem}>
                    <MaterialCommunityIcons name="ruler-square" size={14} color={colors.textMuted} />
                    <Text style={[styles.hDetailText, { color: colors.textMuted }]}>{property.surfaceM2}m²</Text>
                  </View>
                )}
              </View>
              <View style={styles.hBottomRow}>
                <Text style={[styles.hPrice, { color: colors.textPrimary }]}>{formatPrice(property)}</Text>
                <Text style={[styles.hPerMonth, { color: colors.textMuted }]}>/mois</Text>
              </View>
            </View>
            <Pressable onPress={handleFav} style={styles.hFavBtn} hitSlop={8}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? '#FF4444' : colors.textMuted} />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.vCard, animatedStyle]}>
          <View style={styles.vImageWrap}>
            <Image source={{ uri: property.images[0] }} style={styles.vImage} contentFit="cover" transition={300} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              style={styles.vGradient}
            />
            <Pressable onPress={handleFav} style={styles.vFavBtn} hitSlop={8}>
              <View style={styles.glassPill}>
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? '#FF4444' : '#FFF'} />
              </View>
            </Pressable>
            {property.isVerified && (
              <View style={[styles.verifiedBadge, styles.vVerified]}>
                <Ionicons name="checkmark-circle" size={12} color="#0D0D0D" />
                <Text style={styles.verifiedText}>Vérifié</Text>
              </View>
            )}
            <View style={styles.vOverlayInfo}>
              <Text style={styles.vTitle} numberOfLines={1}>{property.title}</Text>
              <View style={styles.vLocRow}>
                <Ionicons name="location" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.vLocation}>{property.commune}, {property.quartier}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.vBottom, { backgroundColor: colors.surface }]}>
            <View style={styles.vPriceRow}>
              <Text style={[styles.vPrice, { color: colors.textPrimary }]}>{formatPrice(property)}</Text>
              <Text style={[styles.vPerMonth, { color: colors.textMuted }]}>/mois</Text>
            </View>
            <View style={styles.vDetailsRow}>
              <View style={styles.vDetailPill}>
                <Ionicons name="bed-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.vDetailText, { color: colors.textSecondary }]}>{property.bedrooms}</Text>
              </View>
              <View style={styles.vDetailPill}>
                <MaterialCommunityIcons name="shower" size={13} color={colors.textSecondary} />
                <Text style={[styles.vDetailText, { color: colors.textSecondary }]}>{property.bathrooms}</Text>
              </View>
              <View style={styles.vDetailPill}>
                <Text style={[styles.vDetailText, { color: colors.textSecondary }]}>{property.type}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  vCard: {
    width: 260,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  vImageWrap: { width: '100%', height: 200, position: 'relative' },
  vImage: { width: '100%', height: '100%' },
  vGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 },
  vFavBtn: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
  glassPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  vVerified: { position: 'absolute', top: 12, left: 12 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8F53A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },
  verifiedText: { fontSize: 10, fontWeight: '700' as const, color: '#0D0D0D' },
  vOverlayInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  vTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' as const },
  vLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  vLocation: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  vBottom: { padding: 12 },
  vPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  vPrice: { fontSize: 15, fontWeight: '800' as const },
  vPerMonth: { fontSize: 11 },
  vDetailsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  vDetailPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  vDetailText: { fontSize: 12 },

  hCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  hImageWrap: { width: 120, height: 120 },
  hImage: { width: '100%', height: '100%' },
  hContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  hTitle: { fontSize: 14, fontWeight: '700' as const },
  hLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  hLocation: { fontSize: 12 },
  hDetailsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  hDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  hDetailText: { fontSize: 11 },
  hBottomRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2, marginTop: 4 },
  hPrice: { fontSize: 14, fontWeight: '800' as const },
  hPerMonth: { fontSize: 10 },
  hFavBtn: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
});
