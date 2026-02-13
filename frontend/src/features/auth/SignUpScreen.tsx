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
    fullName: z.string().min(2, { message: "Nom complet requis" }),
    role: z.enum(["locataire", "proprietaire", "agence"]),
});

type FormData = z.infer<typeof schema>;

export const SignUpScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            role: "locataire",
        }
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                    role: data.role,
                },
            },
        });

        if (error) {
            Alert.alert("Erreur", error.message);
        } else {
            Alert.alert("Succès", "Vérifiez votre email pour confirmer votre inscription.");
            navigation.navigate("Login");
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 justify-center items-center bg-white p-4">
            <Text className="text-3xl font-bold text-primary mb-8">Inscription</Text>

            <View className="w-full max-w-sm">

                <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                            placeholder="Nom complet"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.fullName && <Text className="text-red-500 mb-2">{errors.fullName.message}</Text>}

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

                <View className="flex-row justify-between mb-4">
                    {["locataire", "proprietaire", "agence"].map((role) => (
                        <TouchableOpacity
                            key={role}
                            onPress={() => setValue("role", role as any)}
                            className={`p-2 rounded-lg border ${selectedRole === role ? "bg-primary border-primary" : "bg-white border-gray-300"}`}
                        >
                            <Text className={`${selectedRole === role ? "text-white" : "text-gray-700"} capitalize`}>{role}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    className="bg-primary p-4 rounded-lg items-center"
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">S'inscrire</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 items-center"
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text className="text-gray-600">Déjà un compte ? <Text className="text-primary font-bold">Se connecter</Text></Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
