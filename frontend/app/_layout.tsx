import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from "@expo-google-fonts/inter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AppProvider } from "@/lib/AppProvider";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider, useThemeContext } from "@/lib/ThemeContext";
import { getColors } from "@/constants/colors";
import { NotificationProvider } from "@/lib/NotificationProvider";
import { useApp } from "@/lib/store";

import { useProtectedRoute } from "@/lib/useProtectedRoute";
import { useOnboarding } from "@/lib/useOnboarding";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav({ fontsLoaded }: { fontsLoaded: boolean }) {
  useProtectedRoute();
  useOnboarding();
  const { isDark } = useThemeContext();
  const colors = getColors(isDark);
  const { isLoading: isAppLoading } = useApp();

  useEffect(() => {
    if (fontsLoaded && !isAppLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAppLoading]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Retour",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="property/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="filters"
          options={{
            presentation: Platform.OS === "ios" ? "formSheet" : "modal",
            headerShown: false,
            sheetAllowedDetents: [0.85, 1],
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="property/create"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="property/edit/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <ThemeProvider>
              <AuthProvider>
                <NotificationProvider>
                  <AppProvider>
                    <RootLayoutNav fontsLoaded={fontsLoaded} />
                  </AppProvider>
                </NotificationProvider>
              </AuthProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
