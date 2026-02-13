import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { supabase } from "../utils/supabase";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator, View } from "react-native";

export const RootNavigator = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {session ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};
