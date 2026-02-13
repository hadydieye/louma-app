import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProperty } from "./useProperties";
import { useNavigation } from "@react-navigation/native";

const schema = z.object({
    type: z.string().min(1, "Type requis"),
    city: z.string().min(1, "Ville requise"),
    commune: z.string().min(1, "Commune requise"),
    price_gnf: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, "Prix invalide"),
    description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const CreateProperty = () => {
    const navigation = useNavigation<any>();
    const createPropertyMutation = useCreateProperty();
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormData) => {
        createPropertyMutation.mutate({
            ...data,
            status: "active",
            images_url: [], // Placeholder for now
        }, {
            onSuccess: () => {
                Alert.alert("Succès", "Bien ajouté avec succès");
                navigation.goBack();
            },
            onError: (error) => {
                Alert.alert("Erreur", error.message);
            },
        });
    };

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold text-primary mb-6">Ajouter un bien</Text>

            <Controller
                control={control}
                name="type"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                        placeholder="Type (ex: Appartement, Maison)"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.type && <Text className="text-red-500 mb-2">{errors.type.message}</Text>}

            <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                        placeholder="Ville (ex: Conakry)"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.city && <Text className="text-red-500 mb-2">{errors.city.message}</Text>}

            <Controller
                control={control}
                name="commune"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                        placeholder="Commune (ex: Kaloum)"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.commune && <Text className="text-red-500 mb-2">{errors.commune.message}</Text>}

            <Controller
                control={control}
                name="price_gnf"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                        placeholder="Prix (GNF)"
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text)}
                        value={value ? value.toString() : ""}
                        keyboardType="numeric"
                    />
                )}
            />
            {errors.price_gnf && <Text className="text-red-500 mb-2">{errors.price_gnf.message}</Text>}

            <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50 h-24"
                        placeholder="Description (optionnel)"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        multiline
                        textAlignVertical="top"
                    />
                )}
            />

            <TouchableOpacity
                className="bg-primary p-4 rounded-lg items-center"
                onPress={handleSubmit(onSubmit)}
                disabled={createPropertyMutation.isPending}
            >
                {createPropertyMutation.isPending ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Publier</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};
