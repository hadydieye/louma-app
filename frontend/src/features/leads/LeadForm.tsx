import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateLead } from "./useLeads";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

const schema = z.object({
    budget_gnf: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Budget invalide"),
    professional_status: z.string().optional(),
    desired_duration: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type ParamList = {
    LeadForm: { propertyId: string };
};

export const LeadForm = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<ParamList, "LeadForm">>();
    const { propertyId } = route.params;
    const createLeadMutation = useCreateLead();

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormData) => {
        createLeadMutation.mutate({
            ...data,
            budget_gnf: parseInt(data.budget_gnf, 10),
            property_id: propertyId,
        }, {
            onSuccess: () => {
                Alert.alert("Succès", "Votre demande a été envoyée au propriétaire.");
                navigation.goBack();
            },
            onError: (error) => {
                Alert.alert("Erreur", error.message);
            },
        });
    };

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-xl font-bold text-primary mb-6">Envoyer une demande</Text>
            <Text className="text-gray-600 mb-4">Remplissez ce formulaire pour être mis en relation avec le propriétaire.</Text>

            <Controller
                control={control}
                name="budget_gnf"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                        <Text className="mb-1 text-gray-700 font-medium">Votre budget (GNF)</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                            placeholder="Ex: 2500000"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value ? value.toString() : ""}
                            keyboardType="numeric"
                        />
                    </View>
                )}
            />
            {errors.budget_gnf && <Text className="text-red-500 mb-2">{errors.budget_gnf.message}</Text>}

            <Controller
                control={control}
                name="professional_status"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                        <Text className="mb-1 text-gray-700 font-medium">Situation professionnelle</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-2 bg-gray-50"
                            placeholder="Ex: Salarié, Commerçant..."
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    </View>
                )}
            />

            <Controller
                control={control}
                name="desired_duration"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                        <Text className="mb-1 text-gray-700 font-medium">Durée souhaitée</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-4 bg-gray-50"
                            placeholder="Ex: 1 an renouvelable"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    </View>
                )}
            />

            <TouchableOpacity
                className="bg-primary p-4 rounded-lg items-center mt-4"
                onPress={handleSubmit(onSubmit)}
                disabled={createLeadMutation.isPending}
            >
                {createLeadMutation.isPending ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Envoyer ma demande</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};
