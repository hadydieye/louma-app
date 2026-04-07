import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import React from "react";
import { getColors } from "@/constants/colors";
import { useAuth } from "@/lib/AuthContext";

function NativeTabLayout() {
  const { user, isAuthenticated } = useAuth();
  const isOwner = user?.role === "OWNER" || user?.role === "AGENCY";

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Accueil</Label>
      </NativeTabs.Trigger>
      {!isOwner && (
        <NativeTabs.Trigger name="search" role="search">
          <Icon sf="magnifyingglass" />
          <Label>Recherche</Label>
        </NativeTabs.Trigger>
      )}
      {!isOwner && (
        <NativeTabs.Trigger name="favorites">
          <Icon sf={{ default: "heart", selected: "heart.fill" }} />
          <Label>Favoris</Label>
        </NativeTabs.Trigger>
      )}
      {isOwner && (
        <NativeTabs.Trigger name="my-properties">
          <Icon sf={{ default: "house", selected: "house.fill" }} />
          <Label>Mes Biens</Label>
        </NativeTabs.Trigger>
      )}
      {isAuthenticated && (
        <NativeTabs.Trigger name="leads">
          <Icon sf={{ default: "bubble.left.and.bubble.right", selected: "bubble.left.and.bubble.right.fill" }} />
          <Label>Demandes</Label>
        </NativeTabs.Trigger>
      )}
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout({ colorScheme }: { colorScheme: any }) {
  const { user, isAuthenticated } = useAuth();
  const isOwner = user?.role === "OWNER" || user?.role === "AGENCY";
  const isDark = colorScheme === "dark";
  const colors = getColors(isDark);
  const isWeb = Platform.OS === "web";
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.surface,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Recherche",
          href: isOwner ? null : "/search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoris",
          href: isOwner ? null : "/favorites",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-properties"
        options={{
          title: "Mes Biens",
          href: isOwner ? "/my-properties" : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: "Demandes",
          href: isAuthenticated ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme(); // Move hook here to maintain count
  
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout colorScheme={colorScheme} />;
}
