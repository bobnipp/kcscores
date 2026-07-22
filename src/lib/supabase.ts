import { createClient } from "@supabase/supabase-js";

const testVar = import.meta.env.VITE_TEST_VAR;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log("TEST_VAR:", testVar);
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
}

if (!supabasePublishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured"
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);