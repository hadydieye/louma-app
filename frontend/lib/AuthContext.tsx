import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authApi, saveTokens, clearTokens, getToken, type AuthUser, type LoginPayload, type RegisterPayload } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextValue extends AuthState {
    login: (data: LoginPayload) => Promise<void>;
    register: (data: RegisterPayload) => Promise<void>;
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
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // On mount: check if we already have a stored token and fetch profile
    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (token) {
                    const res = await authApi.me();
                    if (res.success && res.data) {
                        setUser(res.data);
                    } else {
                        await clearTokens();
                    }
                }
            } catch {
                // Token expired or invalid — clean up silently
                await clearTokens();
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (data: LoginPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await authApi.login(data);
            if (res.success && res.data) {
                await saveTokens(res.data.token, res.data.refreshToken);
                setUser(res.data.user);
            }
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
            const res = await authApi.register(data);
            if (res.success && res.data) {
                await saveTokens(res.data.token, res.data.refreshToken);
                setUser(res.data.user);
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : "Erreur lors de l'inscription";
            setError(message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await clearTokens();
        setUser(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value: AuthContextValue = {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
