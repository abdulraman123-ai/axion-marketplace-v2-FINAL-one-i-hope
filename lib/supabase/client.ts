// The Supabase client for use in Client Components ("use client" files) —
// anything that runs in the customer's browser. Uses the public anon key,
// which is safe to expose (it's designed to be public; RLS is what
// actually protects your data, not keeping this key secret).

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";

function createFallbackClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Supabase is not configured yet.", status: 500 },
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: { message: "Supabase is not configured yet.", status: 500 },
      }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({
        data: { user: null, session: null },
        error: { message: "Supabase is not configured yet.", status: 500 },
      }),
    },
  };
}

export function createClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return createFallbackClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
