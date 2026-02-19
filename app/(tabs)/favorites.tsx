import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/store';
import PropertyCard from '@/components/PropertyCard';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { favorites, properties } = useApp();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Favoris</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {favoriteProperties.length} bien{favoriteProperties.length !== 1 ? 's' : ''} sauvegardé{favoriteProperties.length !== 1 ? 's' : ''}
          </Text>
        </Animated.View>
      </View>

      <FlatList
        data={favoriteProperties}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <PropertyCard property={item} variant="horizontal" index={index} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Aucun favori</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Appuyez sur le coeur pour sauvegarder{'\n'}vos biens préférés
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800' as const },
  subtitle: { fontSize: 14, marginTop: 4 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
