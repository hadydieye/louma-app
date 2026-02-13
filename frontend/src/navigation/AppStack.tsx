import React from "react";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TouchableOpacity, Text, View } from "react-native";
import { PropertyDetail } from "../features/properties/PropertyDetail";
import { CreateProperty } from "../features/properties/CreateProperty";
import { LeadForm } from "../features/leads/LeadForm";
import { TenantTabs } from "./TenantTabs";
import { OwnerTabs } from "./OwnerTabs";
import { supabase } from "../utils/supabase";

export type AppStackParamList = {
    Tabs: undefined;
    PropertyDetail: { id: string };
    CreateProperty: undefined;
    LeadForm: { propertyId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

type AppStackProps = {
    role: string;
};

export const AppStack = ({ role }: AppStackProps) => {
    // Determine which tab navigator to use based on role
    const TabComponent = role === "locataire" ? TenantTabs : OwnerTabs;

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={TabComponent}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PropertyDetail"
                component={PropertyDetail}
                options={{ title: "Détails du bien" }}
            />
            <Stack.Screen
                name="CreateProperty"
                component={CreateProperty}
                options={{ title: "Ajouter un bien" }}
            />
            <Stack.Screen
                name="LeadForm"
                component={LeadForm}
                options={{ title: "Intéressé ?" }}
            />
        </Stack.Navigator>
    );
};
