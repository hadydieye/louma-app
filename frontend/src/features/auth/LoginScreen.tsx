import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";

const schema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

type FormData = z.infer<typeof schema>;

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (error) {
            Alert.alert("Erreur", error.message);
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            <Text className="text-3xl font-bold text-primary mb-8">LOUMA</Text>

            <View className="w-full max-w-sm">
                <Text className="text-lg font-semibold mb-2">Connexion</Text>

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                            placeholder="Email"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    )}
                />
                {errors.email && <Text className="text-red-500 mb-2">{errors.email.message}</Text>}

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
                            placeholder="Mot de passe"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry
                        />
                    )}
                />
                {errors.password && <Text className="text-red-500 mb-2">{errors.password.message}</Text>}

                <TouchableOpacity
                    className="bg-primary p-4 rounded-lg items-center"
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Se connecter</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 items-center"
                    onPress={() => navigation.navigate("SignUp")}
                >
                    <Text className="text-gray-600">Pas encore de compte ? <Text className="text-primary font-bold">S'inscrire</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
