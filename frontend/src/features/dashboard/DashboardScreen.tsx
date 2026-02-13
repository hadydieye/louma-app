import React from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase";

export const DashboardScreen = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // Fetch active properties count
            const { count: propertiesCount, error: propError } = await supabase
                .from("properties")
                .select("*", { count: "exact", head: true })
                .eq("owner_id", user.id)
                .eq("status", "active");

            if (propError) throw propError;

            // Fetch leads count (for properties owned by user)
            // This is a bit complex with standard Supabase client without a join or view, 
            // but we can try to fetch all properties IDs first then count leads.
            // Or use a join if we had strict typing setup for it.
            // For MVP, simplified:
            const { data: myProperties } = await supabase
                .from("properties")
                .select("id")
                .eq("owner_id", user.id);

            let leadsCount = 0;
            if (myProperties && myProperties.length > 0) {
                const propertyIds = myProperties.map(p => p.id);
                const { count: lCount, error: leadError } = await supabase
                    .from("leads")
                    .select("*", { count: "exact", head: true })
                    .in("property_id", propertyIds);

                if (leadError) throw leadError;
                leadsCount = lCount || 0;
            }

            return {
                propertiesCount: propertiesCount || 0,
                leadsCount: leadsCount,
            };
        },
    });

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold text-primary mb-6">Tableau de Bord</Text>

            <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-white p-4 rounded-lg shadow-sm items-center">
                    <Text className="text-gray-500 mb-2">Biens Actifs</Text>
                    <Text className="text-3xl font-bold text-primary">{stats?.propertiesCount}</Text>
                </View>

                <View className="flex-1 bg-white p-4 rounded-lg shadow-sm items-center">
                    <Text className="text-gray-500 mb-2">Leads Reçus</Text>
                    <Text className="text-3xl font-bold text-green-600">{stats?.leadsCount}</Text>
                </View>
            </View>

            <View className="bg-white p-4 rounded-lg shadow-sm">
                <Text className="text-lg font-semibold mb-4">Actions Rapides</Text>
                <Text className="text-gray-500">Fonctionnalités à venir...</Text>
            </View>
        </ScrollView>
    );
};
