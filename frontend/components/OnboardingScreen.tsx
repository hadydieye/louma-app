import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'home' as const,
    iconLib: 'ion' as const,
    title: 'Trouvez votre\nlogement idéal',
    subtitle: 'Parcourez des centaines de biens\nvérifiés à travers Conakry',
    gradient: ['#0D0D0D', '#1A1A2E'] as const,
  },
  {
    icon: 'shield-checkmark' as const,
    iconLib: 'ion' as const,
    title: 'Biens vérifiés\net sécurisés',
    subtitle: 'Chaque propriété est inspectée\net validée par notre équipe',
    gradient: ['#1A1A2E', '#16213E'] as const,
  },
  {
    icon: 'handshake' as const,
    iconLib: 'mci' as const,
    title: 'Connectez-vous\ndirectement',
    subtitle: 'Entrez en contact avec les\npropriétaires sans intermédiaire',
    gradient: ['#16213E', '#0D0D0D'] as const,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeOnboarding();
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={[styles.slide, { width }]}>
      <LinearGradient colors={[...item.gradient]} style={StyleSheet.absoluteFill} />
      <View style={styles.slideContent}>
        <Animated.View entering={FadeIn.delay(300)} style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            {item.iconLib === 'ion' ? (
              <Ionicons name={item.icon as any} size={56} color="#B8F53A" />
            ) : (
              <MaterialCommunityIcons name={item.icon as any} size={56} color="#B8F53A" />
            )}
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.slideTitle}>{item.title}</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => i.toString()}
      />
      <View style={[styles.controls, { paddingBottom: Platform.OS === 'web' ? 50 : insets.bottom + 20 }]}>
        <Pressable onPress={handleSkip} hitSlop={12}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <Pressable onPress={handleNext} style={styles.nextBtn}>
          <Ionicons name={activeIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'} size={22} color="#0D0D0D" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideContent: { alignItems: 'center', paddingHorizontal: 40 },
  iconContainer: { marginBottom: 40 },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(184,245,58,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(184,245,58,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#F5F5F0',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(245,245,240,0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  skipText: { fontSize: 15, color: 'rgba(245,245,240,0.5)', fontWeight: '500' as const },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(245,245,240,0.2)' },
  dotActive: { backgroundColor: '#B8F53A', width: 24 },
  nextBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B8F53A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
