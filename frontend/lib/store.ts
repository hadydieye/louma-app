import { createContext, useContext } from 'react';
import { Property, FilterState, UserProfile } from './types';

export interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  properties: Property[];
  filteredProperties: Property[];
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  isLoading: boolean;
}

export interface User extends UserProfile { } // For alias if needed

export const defaultFilters: FilterState = {
  communes: [],
  types: [],
  currency: 'GNF',
  waterReliable: false,
  electricityReliable: false,
  generatorIncluded: false,
  accessibleInRain: false,
  verifiedOnly: false,
  availableNow: false,
};

export const defaultUser: UserProfile = {
  id: 'user1',
  fullName: 'Utilisateur',
  phone: '+224620000000',
  role: 'TENANT',
  completionPercent: 45,
};

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
