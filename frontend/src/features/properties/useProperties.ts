import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase";
import { Property } from "../../types";

export const useProperties = () => {
    return useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .eq("status", "active")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Property[];
        },
    });
};

export const useProperty = (id: string) => {
    return useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Property;
        },
    });
};

export const useCreateProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (property: Omit<Property, "id" | "created_at" | "owner_id">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("properties")
                .insert([{ ...property, owner_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties"] });
        },
    });
};
