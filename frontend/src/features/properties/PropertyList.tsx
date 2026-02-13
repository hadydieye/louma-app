import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, } from "react-native";
import { useProperties } from "./useProperties";
import { useNavigation } from "@react-navigation/native";
import { Property } from "../../types";

export const PropertyList = () => {
    const { data: properties, isLoading, error } = useProperties();
    const navigation = useNavigation<any>();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1e3a8a" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">Erreur de chargement</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: Property }) => (
        <TouchableOpacity
            className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
            onPress={() => navigation.navigate("PropertyDetail", { id: item.id })}
        >
            <Image
                source={{ uri: item.images_url?.[0] || 'https://via.placeholder.com/400x200' }}
                className="w-full h-48"
                resizeMode="cover"
            />
            <View className="p-4">
                <Text className="text-lg font-bold text-primary">{item.price_gnf.toLocaleString()} GNF</Text>
                <Text className="text-gray-600">{item.type} - {item.commune}</Text>
                <Text className="text-gray-500 text-sm mt-1">{item.city}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => (
        <View className="mb-4 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-700">Derniers biens</Text>
            <TouchableOpacity
                onPress={() => navigation.navigate("CreateProperty")}
                className="bg-primary px-4 py-2 rounded-full"
            >
                <Text className="text-white font-bold">+ Ajouter</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <FlatList
                data={properties}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center mt-10">
                        <Text className="text-gray-500">Aucun bien disponible pour le moment.</Text>
                    </View>
                }
            />
        </View>
    );
};
