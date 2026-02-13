import React from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useProperty } from "./useProperties";
import { Property } from "../../types";

type ParamList = {
    PropertyDetail: { id: string };
};

export const PropertyDetail = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<ParamList, "PropertyDetail">>();
    const { id } = route.params;
    const { data: property, isLoading, error } = useProperty(id);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    if (error || !property) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">Erreur de chargement ou bien non trouvé</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            <Image
                source={{ uri: property.images_url?.[0] || 'https://via.placeholder.com/400x300' }}
                className="w-full h-64"
                resizeMode="cover"
            />
            <View className="p-4">
                <Text className="text-2xl font-bold text-primary mb-2">{property.price_gnf.toLocaleString()} GNF</Text>
                <Text className="text-xl font-semibold mb-1">{property.type}</Text>
                <Text className="text-gray-600 mb-4">{property.commune}, {property.city}</Text>

                <View className="h-[1px] bg-gray-200 mb-4" />

                <Text className="text-lg font-semibold mb-2">Description</Text>
                <Text className="text-gray-700 leading-6 mb-6">{property.description}</Text>

                <TouchableOpacity
                    className="bg-primary p-4 rounded-lg items-center"
                    onPress={() => navigation.navigate("LeadForm", { propertyId: property.id })}
                >
                    <Text className="text-white font-bold text-lg">Je suis intéressé</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
