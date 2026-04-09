import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, Platform, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/lib/store';
import { useRouter } from 'expo-router';

const slides = [
  {
    icon: 'home' as const,
    iconLib: 'ion' as const,
    title: 'Trouvez votre\nlogement idéal',
    subtitle: 'Parcourez des centaines de biens\nvérifiés à travers tout le pays.',
    gradient: ['#0D0D0D', '#1A1A2E'] as const,
  },
  {
    icon: 'options' as const,
    iconLib: 'ion' as const,
    title: 'Filtres\nintelligents',
    subtitle: 'Eau SEEG, électricité fiable, clim...\nTrouvez le confort qui vous convient.',
    gradient: ['#1A1A2E', '#16213E'] as const,
  },
  {
    icon: 'location' as const,
    iconLib: 'ion' as const,
    title: 'Cherchez par\nquartier',
    subtitle: 'Ratoma, Kaloum, Dixinn...\nLa perle rare est forcément proche.',
    gradient: ['#16213E', '#1B1B2F'] as const,
  },
  {
    icon: 'shield-checkmark' as const,
    iconLib: 'ion' as const,
    title: 'Biens vérifiés\net sécurisés',
    subtitle: 'Chaque propriété est inspectée\net validée physiquement par nos agents.',
    gradient: ['#1B1B2F', '#0F3460'] as const,
  },
  {
    icon: 'chatbubbles' as const,
    iconLib: 'ion' as const,
    title: 'Zéro\nintermédiaire',
    subtitle: 'Contactez directement les bailleurs\nsans frais de commission inutiles.',
    gradient: ['#0F3460', '#16213E'] as const,
  },
  {
    icon: 'rocket' as const,
    iconLib: 'ion' as const,
    title: 'Prêt à\nemménager ?',
    subtitle: 'Commencez votre nouvelle vie\navec Louma dès aujourd\'hui.',
    gradient: ['#16213E', '#0D0D0D'] as const,
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isDesktop = Platform.OS === 'web' && width > 768;
  const contentWidth = isDesktop ? Math.min(width, 1200) : width;

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width: contentWidth }]}>
      <LinearGradient colors={[...item.gradient]} style={StyleSheet.absoluteFill} />
      <View style={[styles.slideContent, isDesktop && styles.desktopSlideContent]}>
        <Animated.View entering={FadeIn.delay(300)} style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <View style={styles.iconInnerCircle}>
              {item.iconLib === 'ion' ? (
                <Ionicons name={item.icon as any} size={isDesktop ? 64 : 56} color="#B8F53A" />
              ) : (
                <MaterialCommunityIcons name={item.icon as any} size={isDesktop ? 64 : 56} color="#B8F53A" />
              )}
            </View>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400)} style={styles.textContainer}>
          <Text style={[styles.slideTitle, isDesktop && styles.desktopTitle]}>{item.title}</Text>
          <Text style={[styles.slideSubtitle, isDesktop && styles.desktopSubtitle]}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.mainWrapper, isDesktop && { width: contentWidth, alignSelf: 'center' }]}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, index) => ({
            length: contentWidth,
            offset: contentWidth * index,
            index,
          })}
        />
        <View style={[
          styles.controls,
          { 
            paddingBottom: Platform.OS === 'web' ? (isDesktop ? 60 : 40) : insets.bottom + 20,
            width: isDesktop ? contentWidth - 80 : width,
            alignSelf: 'center'
          }
        ]}>
          <Pressable onPress={handleSkip} hitSlop={12} style={styles.skipBtn}>
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
            <Ionicons name={activeIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'} size={24} color="#0D0D0D" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  mainWrapper: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  slideContent: { 
    alignItems: 'center', 
    paddingHorizontal: 40,
    width: '100%',
    justifyContent: 'center',
    gap: 40
  },
  desktopSlideContent: {
    paddingHorizontal: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 80
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: Platform.OS === 'web' ? 240 : 180,
    height: Platform.OS === 'web' ? 240 : 180,
    borderRadius: Platform.OS === 'web' ? 120 : 90,
    backgroundColor: 'rgba(184,245,58,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(184,245,58,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerCircle: {
    width: Platform.OS === 'web' ? 180 : 140,
    height: Platform.OS === 'web' ? 180 : 140,
    borderRadius: Platform.OS === 'web' ? 90 : 70,
    backgroundColor: 'rgba(184,245,58,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(184,245,58,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8F53A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  textContainer: {
    maxWidth: 500,
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  slideTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800' as const,
    color: '#F5F5F0',
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  desktopTitle: {
    fontSize: 48,
    lineHeight: 56,
  },
  slideSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(245,245,240,0.6)',
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
    fontWeight: '400' as const,
  },
  desktopSubtitle: {
    fontSize: 18,
    lineHeight: 28,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  skipBtn: {
    paddingVertical: 10,
  },
  skipText: { 
    fontSize: 16, 
    color: 'rgba(245,245,240,0.4)', 
    fontWeight: '600' as const,
    letterSpacing: 0.5
  },
  dots: { 
    flexDirection: 'row', 
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: 'rgba(245,245,240,0.2)' 
  },
  dotActive: { 
    backgroundColor: '#B8F53A', 
    width: 20 
  },
  nextBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#B8F53A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8F53A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
