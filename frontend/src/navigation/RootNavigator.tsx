import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { supabase } from "../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator, View, Text } from "react-native";

export const RootNavigator = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>("locataire");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                console.log("[RootNavigator] Fetching session...");
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("[RootNavigator] Error fetching session:", error);
                    setError(`Session error: ${error.message}`);
                }
                console.log("[RootNavigator] Session:", session?.user?.email);
                setSession(session);

                // Extract role from user metadata
                if (session?.user?.user_metadata?.role) {
                    setUserRole(session.user.user_metadata.role);
                }
            } catch (err) {
                console.error("[RootNavigator] Unexpected error initializing session:", err);
                setError(JSON.stringify(err));
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("[RootNavigator] Auth state changed:", _event, session?.user?.email);
            setSession(session);
            if (session?.user?.user_metadata?.role) {
                setUserRole(session.user.user_metadata.role);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-lg text-gray-700 mb-4">Chargement...</Text>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center bg-white p-4">
                <Text className="text-red-600 text-center mb-4">Erreur</Text>
                <Text className="text-gray-700 text-center text-sm">{error}</Text>
            </View>
        );
    }

    if (!session) {
        return (
            <NavigationContainer>
                <AuthStack />
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer>
            <AppStack role={userRole} />
        </NavigationContainer>
    );
};
