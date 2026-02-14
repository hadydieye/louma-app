import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "../../utils/supabase";
import { useNavigation } from "@react-navigation/native";
import { useGoogleSignIn } from "./useGoogleSignIn";
import { GoogleSignInButton } from "../../shared/GoogleSignInButton";

const schema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

type FormData = z.infer<typeof schema>;

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleSignIn();
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                Alert.alert("Erreur", error.message);
            }
        } catch (err) {
            console.error("[LoginScreen] Error:", err);
            Alert.alert("Erreur", "Une erreur s'est produite");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        console.log("[LoginScreen] Starting Google Sign-In");
        const result = await signInWithGoogle();
        if (result.error) {
            console.error("[LoginScreen] Google sign-in error:", result.error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 40 }}>LOUMA</Text>

            <View style={{ width: '100%', maxWidth: 400 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 20 }}>Connexion</Text>

                {/* Google Sign-In Button */}
                <GoogleSignInButton 
                    onPress={handleGoogleSignIn}
                    loading={googleLoading}
                    error={googleError}
                />

                {/* Divider */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 8 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>OU</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                </View>

                {/* Email/Password Form */}
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ 
                                borderWidth: 1, 
                                borderColor: '#d1d5db', 
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                marginBottom: 8,
                                backgroundColor: '#f9fafb',
                                fontSize: 14
                            }}
                            placeholder="Email"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    )}
                />
                {errors.email && (
                    <Text style={{ color: '#ef4444', marginBottom: 8, fontSize: 12 }}>
                        {errors.email.message}
                    </Text>
                )}

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={{ 
                                borderWidth: 1, 
                                borderColor: '#d1d5db', 
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                marginBottom: 16,
                                backgroundColor: '#f9fafb',
                                fontSize: 14
                            }}
                            placeholder="Mot de passe"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry
                        />
                    )}
                />
                {errors.password && (
                    <Text style={{ color: '#ef4444', marginBottom: 8, fontSize: 12 }}>
                        {errors.password.message}
                    </Text>
                )}

                <TouchableOpacity
                    style={{ 
                        backgroundColor: '#1e3a8a', 
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center'
                    }}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            Se connecter
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginTop: 20, alignItems: 'center' }}
                    onPress={() => navigation.navigate("SignUp")}
                >
                    <Text style={{ color: '#4b5563' }}>
                        Pas encore de compte ? <Text style={{ color: '#1e3a8a', fontWeight: 'bold' }}>S'inscrire</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
