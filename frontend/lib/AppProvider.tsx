import React, { useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { AppContext, defaultFilters } from './store';
import { Property, FilterState } from './types';
import { propertiesApi } from './api';
import { useAuth } from './AuthContext';

const FAVORITES_KEY = '@louma_favorites';
const ONBOARDING_KEY = '@louma_onboarding';

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Fetch properties from real API
  const { data: propertiesData, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.list(),
  });

  const properties = (propertiesData?.data as Property[]) || [];

  useEffect(() => {
    (async () => {
      try {
        const [favs, onboarding] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(ONBOARDING_KEY),
        ]);
        if (favs) setFavorites(JSON.parse(favs));
        setHasCompletedOnboarding(onboarding === 'true');
      } catch (e) {
        console.error('Failed to load local data:', e);
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
    let results = properties;

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
  }, [properties, searchQuery, filters]);

  const value = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorite,
    properties,
    filteredProperties,
    filters,
    setFilters,
    resetFilters,
    activeFiltersCount,
    searchQuery,
    setSearchQuery,
    user: user || null,
    isAuthenticated,
    hasCompletedOnboarding,
    completeOnboarding,
    isLoading: !loaded || isLoadingProperties,
  }), [favorites, toggleFavorite, isFavorite, properties, filteredProperties, filters, setFilters, resetFilters, activeFiltersCount, searchQuery, user, isAuthenticated, hasCompletedOnboarding, completeOnboarding, loaded, isLoadingProperties]);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={value as any}>
      {children}
    </AppContext.Provider>
  );
}
