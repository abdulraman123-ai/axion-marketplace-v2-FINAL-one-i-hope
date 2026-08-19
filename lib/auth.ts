// Server-side authentication helpers shared across protected routes.
// Never import from client components.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// NOTE: We intentionally do NOT cache the user at module scope. The proxy
// already refreshes auth on every request, and module-level caching can
// leak auth state across requests in serverless/edge environments and
// test runners. Call getCurrentUser() directly per request.

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserCached() {
  return getCurrentUser();
}

// Requires an authenticated user. Redirects to /sign-in otherwise.
// Returns the user for use in layouts/pages.
export async function requireAuth() {
  const user = await getCurrentUserCached();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}