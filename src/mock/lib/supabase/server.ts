// Re-export the consolidated mock Supabase implementation so all routes share
// the same chainable, awaitable client surface (auth.getUser, rpc, query
// builder, etc.) regardless of which import path they use.
export { createClient, createMockSupabaseClient } from "@/lib/supabase/server";
