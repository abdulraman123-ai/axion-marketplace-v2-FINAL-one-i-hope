// The Supabase client for use in Server Components and Route Handlers —
// anything that runs on the server, per-request. This version is
// cookie-aware, so it can read the logged-in user's session from the
// incoming request and stays in sync with what the browser client sees.
//
// Still uses the public anon key here, not the service role key — this
// client respects RLS just like the browser one does. Only the checkout
// and webhook routes use the service role key directly, and only for the
// specific operations that genuinely need to bypass RLS (see those files).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";

function createFallbackQueryBuilder<T>(data: T | null = null, error: { message: string; status: number } | null = null) {
  const builder = {
    data,
    error,
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    order() {
      return builder;
    },
    insert() {
      return createFallbackQueryBuilder<T>(null, {
        message: "Supabase is not configured yet.",
        status: 500,
      });
    },
    update() {
      return createFallbackQueryBuilder<T>(null, {
        message: "Supabase is not configured yet.",
        status: 500,
      });
    },
    delete() {
      return createFallbackQueryBuilder<T>(null, {
        message: "Supabase is not configured yet.",
        status: 500,
      });
    },
    upsert() {
      return createFallbackQueryBuilder<T>(null, {
        message: "Supabase is not configured yet.",
        status: 500,
      });
    },
    single: async () => ({ data: data ?? null, error }),
    maybeSingle: async () => ({ data: data ?? null, error }),
    then(resolve: (value: { data: T | null; error: { message: string; status: number } | null }) => unknown) {
      return Promise.resolve({ data, error }).then(resolve);
    },
    catch(reject: (reason?: unknown) => unknown) {
      return Promise.resolve({ data, error }).catch(reject);
    },
  };

  return builder;
}

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
    from() {
      return createFallbackQueryBuilder([]);
    },
  };
}

// A small, self-contained type for cookie options, defined right here
// instead of imported — this avoids depending on an exact type name from
// @supabase/ssr, which can differ slightly between versions.
type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return createFallbackClient() as ReturnType<typeof createServerClient>;
  }

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // Explicit type here — this is the exact fix that was missing.
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't set cookies directly — this is
            // expected and safe to ignore as long as proxy.ts (added
            // in Milestone 6) is refreshing sessions on every request.
          }
        },
      },
    }
  );
}
