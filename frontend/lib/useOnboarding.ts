import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useApp } from './store';

/**
 * Hook to manage onboarding flow
 * Shows onboarding to first-time users before they can access the app
 */
export function useOnboarding() {
    const segments = useSegments();
    const router = useRouter();
    const { hasCompletedOnboarding, isLoading, completeOnboarding } = useApp();

    useEffect(() => {
        if (isLoading) return;

        const inOnboardingGroup = segments[0] === 'onboarding';
        const inAuthGroup = segments[0] === 'auth';

        // If user hasn't completed onboarding, redirect to onboarding
        if (!hasCompletedOnboarding && !inOnboardingGroup) {
            router.replace('/onboarding');
        } 
        // If user completed onboarding but is still on onboarding screen, redirect to auth
        else if (hasCompletedOnboarding && inOnboardingGroup) {
            router.replace('/auth');
        }
    }, [hasCompletedOnboarding, segments, isLoading, router]);

    return {
        hasCompletedOnboarding,
        isLoading,
        completeOnboarding,
    };
}
