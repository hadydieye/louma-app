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

        // If user hasn't completed onboarding, and they are not already in common non-onboarding flows (like auth)
        // or they are at the root, redirect to onboarding.
        if (!hasCompletedOnboarding && !inOnboardingGroup) {
            router.replace('/onboarding');
        }
        // If user completed onboarding but is still on onboarding screen, redirect out.
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
