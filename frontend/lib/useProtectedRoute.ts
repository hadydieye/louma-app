import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './AuthContext';

/**
 * Hook to protect routes by redirecting unauthenticated users to the auth screen.
 * It also handles redirecting authenticated users away from the auth screen.
 */
export function useProtectedRoute() {
    const segments = useSegments();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!isAuthenticated && !inAuthGroup) {
            // If the user is not authenticated and is trying to access a protected route
            // For now, only the (tabs)/profile and potentially future screens are protected.
            // We can check specific segments for more fine-grained control.

            // Example: Protect only the profile tab for now
            const isProfileTab = segments[0] === '(tabs)' && segments[1] === 'profile';

            if (isProfileTab) {
                router.replace('/auth');
            }
        } else if (isAuthenticated && inAuthGroup) {
            // If the user is authenticated and tries to access the auth screen, send them home
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, segments, isLoading]);
}
