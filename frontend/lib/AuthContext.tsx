import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { type UserProfile, type LoginPayload, type RegisterPayload } from './types';
import { queryClient } from './query-client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextValue extends AuthState {
    login: (data: LoginPayload) => Promise<void>;
    register: (data: RegisterPayload) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        // Map snake_case to CamelCase profile fields
        return {
            id: data.id,
            fullName: data.full_name,
            phone: data.phone,
            email: data.email,
            avatar: data.avatar,
            role: data.role,
            commune: data.commune,
            budget: data.budget ? parseFloat(data.budget) : undefined,
            budgetCurrency: data.budget_currency,
            profession: data.profession,
            householdSize: data.household_size,
            completionPercent: data.completion_percent,
        } as UserProfile;
    }, []);

    // Handle authentication state changes
    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            }
            setIsLoading(false);
        };

        initializeAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const login = useCallback(async (data: LoginPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) throw authError;

            // Note: setUser is handled by onAuthStateChange
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Erreur lors de la connexion';
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.fullName,
                        phone: data.phone,
                        role: data.role || 'TENANT',
                    },
                },
            });

            if (authError) throw authError;

            // Note: setUser is handled by onAuthStateChange via the trigger
        } catch (e) {
            const message = e instanceof Error ? e.message : "Erreur lors de l'inscription";
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setError(null);
        await supabase.auth.signOut();
        setUser(null);
        // Clear all react-query caches to prevent stale data (e.g. ownerName)
        // from persisting across account switches
        queryClient.clear();
    }, []);

    const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!user?.id) throw new Error("Utilisateur non connecté");
        setIsLoading(true);
        setError(null);

        try {
            // Map camelCase keys back to snake_case for Supabase
            const updatePayload: any = {};
            if (data.fullName !== undefined) updatePayload.full_name = data.fullName;
            if (data.phone !== undefined) updatePayload.phone = data.phone;
            if (data.avatar !== undefined) updatePayload.avatar = data.avatar;
            if (data.commune !== undefined) updatePayload.commune = data.commune;
            if (data.budget !== undefined) updatePayload.budget = data.budget;
            if (data.budgetCurrency !== undefined) updatePayload.budget_currency = data.budgetCurrency;
            if (data.profession !== undefined) updatePayload.profession = data.profession;
            if (data.householdSize !== undefined) updatePayload.household_size = data.householdSize;

            const { error: updateError } = await supabase
                .from('users')
                .update(updatePayload)
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Refresh local user state
            const updatedProfile = await fetchProfile(user.id);
            setUser(updatedProfile);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Erreur lors de la mise à jour du profil";
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [user, fetchProfile]);

    const clearError = useCallback(() => setError(null), []);

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        updateProfile,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
