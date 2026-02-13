import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PropertyList } from "../features/properties/PropertyList";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = "•";
                    // We could use Ionicons here if installed, but for now simple text/symbol
                    if (route.name === "Explorer") {
                        return <Text style={{ color, fontSize: 20 }}>🏠</Text>;
                    } else if (route.name === "Tableau de Bord") {
                        return <Text style={{ color, fontSize: 20 }}>📊</Text>;
                    } else if (route.name === "Profil") {
                        return <Text style={{ color, fontSize: 20 }}>👤</Text>;
                    }
                    return <Text style={{ color }}>{iconName}</Text>;
                },
                tabBarActiveTintColor: "#1e3a8a",
                tabBarInactiveTintColor: "gray",
            })}
        >
            <Tab.Screen name="Explorer" component={PropertyList} options={{ title: "Biens" }} />
            <Tab.Screen name="Tableau de Bord" component={DashboardScreen} />
            <Tab.Screen name="Profil" component={ProfileScreen} />
        </Tab.Navigator>
    );
};
