import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

export const OwnerTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === "Tableau de Bord") {
                        return <Text style={{ color, fontSize: 20 }}>📊</Text>;
                    } else if (route.name === "Profil") {
                        return <Text style={{ color, fontSize: 20 }}>👤</Text>;
                    }
                    return <Text style={{ color }}>•</Text>;
                },
                tabBarActiveTintColor: "#1e3a8a",
                tabBarInactiveTintColor: "gray",
            })}
        >
            <Tab.Screen name="Tableau de Bord" component={DashboardScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
};
