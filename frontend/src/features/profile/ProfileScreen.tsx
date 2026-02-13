import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { supabase } from "../../utils/supabase";
import { User } from "../../types";

export const ProfileScreen = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                // Fetch additional user data from public.users table if needed
                // For now just use auth user metadata
                setUser({
                    id: user.id,
                    email: user.email!,
                    role: user.user_metadata.role || 'locataire',
                    full_name: user.user_metadata.full_name,
                });
            }
        });
    }, []);

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold text-primary mb-6">Mon Profil</Text>

            {user && (
                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-gray-200 rounded-full justify-center items-center mb-4">
                        <Text className="text-2xl font-bold text-gray-500">{user.full_name?.[0] || user.email[0].toUpperCase()}</Text>
                    </View>
                    <Text className="text-xl font-bold">{user.full_name || "Utilisateur"}</Text>
                    <Text className="text-gray-500">{user.email}</Text>
                    <Text className="text-primary font-medium mt-1 capitalize">{user.role}</Text>
                </View>
            )}

            <TouchableOpacity
                className="bg-gray-100 p-4 rounded-lg mb-4"
                onPress={() => { }} // TODO: Edit profile
            >
                <Text className="text-gray-700">Modifier mon profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-gray-100 p-4 rounded-lg mb-4"
                onPress={() => { }} // TODO: Settings
            >
                <Text className="text-gray-700">Paramètres</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-red-50 p-4 rounded-lg mt-auto"
                onPress={() => supabase.auth.signOut()}
            >
                <Text className="text-red-500 font-bold text-center">Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
};
