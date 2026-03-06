import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Make sure you load .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPropertyCreation(email, password, role) {
    console.log(`\n--- Testing Property Creation for ${email} (Role: ${role}) ---`);

    // 1. Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError || !authData.user) {
        console.error(`❌ Login failed for ${email}:`, authError?.message);
        return;
    }
    console.log(`✅ Logged in as ${email} (User ID: ${authData.user.id})`);

    // 2. Attempt to create a property
    const payload = {
        title: `Test Property by ${role}`,
        description: "This is a test to verify RLS.",
        type: "Appartement",
        commune: "Ratoma",
        quartier: "Kipé",
        price_gnf: 1500000,
        surface_m2: 50,
        total_rooms: 2,
        bedrooms: 1,
        bathrooms: 1,
        furnished: "Vide",
        condition: "Bon état",
        water_supply: "SEEG fiable",
        electricity_type: "EDG fiable",
        available_from: new Date().toISOString(),
        owner_id: authData.user.id
    };

    const { data: property, error: insertError } = await supabase
        .from('properties')
        .insert([payload])
        .select()
        .single();

    if (insertError) {
        console.log(`Insert result: ❌ FAILED`);
        console.log(`Error message: ${insertError.message}`);
        // If tenant, we EXPECT it to fail with RLS violation or related
        if (role === 'TENANT') {
            console.log(`✅ Expected failure for TENANT role.`);
        } else {
            console.log(`❌ Unexpected failure for ${role} role.`);
        }
    } else {
        console.log(`Insert result: ✅ SUCCESS`);
        console.log(`Created property ID: ${property.id}`);
        if (role === 'TENANT') {
            console.log(`❌ Unexpected success for TENANT role! RLS IS BYPASSED!`);
        } else {
            console.log(`✅ Expected success for ${role} role.`);

            // Cleanup: Delete the property
            const { error: deleteError } = await supabase
                .from('properties')
                .delete()
                .eq('id', property.id);

            if (deleteError) {
                console.log(`❌ Failed to delete test property: ${deleteError.message}`);
            } else {
                console.log(`✅ Test property deleted successfully.`);
            }
        }
    }

    // Sign out
    await supabase.auth.signOut();
}

async function runTests() {
    console.log("Starting Security & Functional Tests...\n");

    // Test as OWNER
    await testPropertyCreation('owner@test.com', 'Password123!', 'OWNER');

    // Test as TENANT
    await testPropertyCreation('tenant@test.com', 'Password123!', 'TENANT');

    // Test as AGENCY
    await testPropertyCreation('agency@test.com', 'Password123!', 'AGENCY');

    console.log("\nTests Complete.");
}

runTests();
