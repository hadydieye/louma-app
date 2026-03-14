import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://jjpbvbwxdyfepiycnlpl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqcGJ2Ynd4ZHlmZXBpeWNubHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTc3NDksImV4cCI6MjA4ODM3Mzc0OX0.WEF6JAjRNCJElKmi81TD8DaeOOoPr-ChKRMVTzo9Rpw"
);

async function run() {
  const { data, error } = await supabaseClient
    .from('leads')
    .select(`
      *,
      user:users (
        id,
        full_name,
        phone,
        avatar
      ),
      property:properties (
        id,
        title
      )
    `)
    .limit(1);
    
  console.log(JSON.stringify(data?.[0], null, 2));
}

run().catch(console.error);
