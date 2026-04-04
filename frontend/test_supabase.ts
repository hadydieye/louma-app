import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: lead, error: fetchError } = await supabase.from('leads').select('*').limit(1).single();
    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }
    console.log('Lead before:', lead);

    // Try updating
    const { data, error } = await supabase.from('leads').update({ status: 'CONTACTED' }).eq('id', lead.id).select().single();
    console.log('Update result:', { data, error });
    
    // revert
    await supabase.from('leads').update({ status: lead.status }).eq('id', lead.id);
}

test();
