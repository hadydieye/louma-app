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
    fullName: z.string().min(2, { message: "Nom complet requis" }),
    role: z.enum(["locataire", "proprietaire", "agence"]),
});

type FormData = z.infer<typeof schema>;

export const SignUpScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle, loading: googleLoading, error: googleError } = useGoogleSignIn();
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            role: "locataire",
        }
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: FormData) => {
        try {
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
        } catch (err) {
            console.error("[SignUpScreen] Error:", err);
            Alert.alert("Erreur", "Une erreur s'est produite");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        console.log("[SignUpScreen] Starting Google Sign-Up");
        const result = await signInWithGoogle();
        if (result.error) {
            console.error("[SignUpScreen] Google sign-up error:", result.error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 40 }}>LOUMA</Text>

            <View style={{ width: '100%', maxWidth: 400 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 20 }}>Inscription</Text>

                {/* Google Sign-In Button */}
                <GoogleSignInButton 
                    onPress={handleGoogleSignUp}
                    loading={googleLoading}
                    error={googleError}
                />

                {/* Divider */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 8 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>OU</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#d1d5db' }} />
                </View>

                {/* Full Name */}
                <Controller
                    control={control}
                    name="fullName"
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
                            placeholder="Nom complet"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.fullName && (
                    <Text style={{ color: '#ef4444', marginBottom: 8, fontSize: 12 }}>
                        {errors.fullName.message}
                    </Text>
                )}

                {/* Email */}
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

                {/* Password */}
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

                {/* Role Selection */}
                <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 10, color: '#374151' }}>
                    Vous êtes :
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
                    {["locataire", "proprietaire", "agence"].map((role) => (
                        <TouchableOpacity
                            key={role}
                            onPress={() => setValue("role", role as any)}
                            style={{ 
                                flex: 1,
                                paddingVertical: 10,
                                paddingHorizontal: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: selectedRole === role ? '#1e3a8a' : '#d1d5db',
                                backgroundColor: selectedRole === role ? '#1e3a8a' : '#fff',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ 
                                color: selectedRole === role ? '#fff' : '#374151',
                                fontWeight: '500',
                                fontSize: 12,
                                textTransform: 'capitalize'
                            }}>
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Up Button */}
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
                            S'inscrire
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login */}
                <TouchableOpacity
                    style={{ marginTop: 20, alignItems: 'center' }}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={{ color: '#4b5563' }}>
                        Déjà un compte ? <Text style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Se connecter</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
