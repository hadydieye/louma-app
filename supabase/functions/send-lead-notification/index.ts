// Rule 4: Deno Syntax (No package.json, ESM only)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { record } = await req.json();

        // 1. Get Property and Owner details
        const { data: property, error: propertyError } = await supabaseClient
            .from("properties")
            .select(`
        title,
        owner_id,
        users (
          push_token,
          full_name
        )
      `)
            .eq("id", record.property_id)
            .single();

        if (propertyError || !property) {
            console.error("Error fetching property owner:", propertyError);
            return new Response("Property owner not found", { status: 404 });
        }

        const { users: owner } = property;
        //@ts-ignore - Handle possible array or object depending on schema interpretation
        const pushToken = owner?.push_token;

        if (!pushToken) {
            console.log("No push token found for owner", property.owner_id);
            return new Response("No push token", { status: 200 });
        }

        // 2. Prepare Notification
        const message = {
            to: pushToken,
            sound: "default",
            title: "Nouveau lead ! 🏠",
            body: `Quelqu'un est intéressé par "${property.title}".`,
            data: { leadId: record.id, propertyId: record.property_id },
        };

        // 3. Send to Expo
        const response = await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log("Expo response:", result);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Function error:", err);
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
    }
});
