import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './AuthContext';

/**
 * Handles only one case: authenticated user landing on /auth → redirect home.
 * Guest users are NOT redirected anywhere — they browse freely.
 */
export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments, isLoading]);
}

/**
 * Use this inside owner-only screens (my-properties, leads, etc.).
 * Returns whether the current user is authenticated.
 * Does NOT redirect — the screen itself renders a login prompt.
 */
export function useGuestGuard(): { isGuest: boolean; isLoading: boolean } {
    const { isAuthenticated, isLoading } = useAuth();
    return { isGuest: !isAuthenticated, isLoading };
}
