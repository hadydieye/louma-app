import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase";
import { Lead } from "../../types";

export const useCreateLead = () => {
    return useMutation({
        mutationFn: async (lead: Omit<Lead, "id" | "created_at" | "tenant_id" | "status">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("leads")
                .insert([{ ...lead, tenant_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    });
};
