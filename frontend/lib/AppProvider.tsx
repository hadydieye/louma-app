import React, { useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext, defaultFilters, defaultUser } from './store';
import { Property, FilterState, UserProfile } from './types';
import { sampleProperties } from './sample-data';

const FAVORITES_KEY = '@louma_favorites';
const ONBOARDING_KEY = '@louma_onboarding';
const USER_KEY = '@louma_user';

export function AppProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [favs, onboarding, userData] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (favs) setFavorites(JSON.parse(favs));
        setHasCompletedOnboarding(onboarding === 'true');
        if (userData) setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  const setFilters = useCallback((f: FilterState) => setFiltersState(f), []);

  const resetFilters = useCallback(() => setFiltersState(defaultFilters), []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.communes.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.furnished !== undefined) count++;
    if (filters.waterReliable) count++;
    if (filters.electricityReliable) count++;
    if (filters.generatorIncluded) count++;
    if (filters.accessibleInRain) count++;
    if (filters.verifiedOnly) count++;
    if (filters.availableNow) count++;
    return count;
  }, [filters]);

  const filteredProperties = useMemo(() => {
    let results = sampleProperties;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.commune.toLowerCase().includes(q) ||
        p.quartier.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }

    if (filters.communes.length > 0) {
      results = results.filter(p => filters.communes.includes(p.commune));
    }
    if (filters.types.length > 0) {
      results = results.filter(p => filters.types.includes(p.type));
    }
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.priceGNF >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.priceGNF <= (filters.maxPrice ?? Infinity));
    }
    if (filters.bedrooms !== undefined) {
      results = results.filter(p => p.bedrooms >= (filters.bedrooms ?? 0));
    }
    if (filters.furnished !== undefined) {
      results = results.filter(p => p.furnished === filters.furnished);
    }
    if (filters.waterReliable) {
      results = results.filter(p => p.waterSupply === 'SEEG fiable');
    }
    if (filters.electricityReliable) {
      results = results.filter(p => p.electricityType === 'EDG fiable');
    }
    if (filters.generatorIncluded) {
      results = results.filter(p => p.generatorIncluded);
    }
    if (filters.accessibleInRain) {
      results = results.filter(p => p.accessibleInRain);
    }
    if (filters.verifiedOnly) {
      results = results.filter(p => p.isVerified);
    }
    if (filters.availableNow) {
      results = results.filter(p => new Date(p.availableFrom) <= new Date());
    }

    return results;
  }, [searchQuery, filters]);

  const value = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorite,
    properties: sampleProperties,
    filteredProperties,
    filters,
    setFilters,
    resetFilters,
    activeFiltersCount,
    searchQuery,
    setSearchQuery,
    user,
    hasCompletedOnboarding,
    completeOnboarding,
  }), [favorites, toggleFavorite, isFavorite, filteredProperties, filters, setFilters, resetFilters, activeFiltersCount, searchQuery, user, hasCompletedOnboarding, completeOnboarding]);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
