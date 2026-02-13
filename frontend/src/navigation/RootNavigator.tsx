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

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("Error fetching session:", error);
                }
                setSession(session);

                // Extract role from user metadata
                if (session?.user?.user_metadata?.role) {
                    setUserRole(session.user.user_metadata.role);
                }
            } catch (err) {
                console.error("Unexpected error initializing session:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user?.user_metadata?.role) {
                setUserRole(session.user.user_metadata.role);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text style={{ fontSize: 20, color: 'blue', marginBottom: 20 }}>Loading Session...</Text>
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    if (!session) {
        try {
            return (
                <NavigationContainer>
                    <AuthStack />
                </NavigationContainer>
            )
        } catch (e) {
            return <View><Text>Error rendering AuthStack: {JSON.stringify(e)}</Text></View>
        }
    }

    return (
        <NavigationContainer>
            <AppStack role={userRole} />
        </NavigationContainer>
    );
};
