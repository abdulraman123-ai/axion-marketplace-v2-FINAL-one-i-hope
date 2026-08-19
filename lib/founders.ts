// LEGACY founder allowlist — kept ONLY for backward compatibility with the
// original founder_emails flow. The PRIMARY authorization system is now:
//
//   auth.users → user_roles → roles
//
// See lib/admin.ts (getCurrentUserRoles / requireAdmin) and the migration
// supabase/migrations/0001_initial_schema.sql.
//
// This function is used as a last-resort fallback in lib/admin.ts so that
// existing founder emails keep working until the owner migrates them to the
// new role system. It can never grant MORE privilege than the role system,
// and it returns false whenever the service-role key is unavailable.

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

// Checks whether an email is in the founder_emails allowlist. Uses the
// service role key deliberately — founder_emails has no RLS read policy for
// regular users, so this is the only way to read it at all.
export async function isFounder(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return false;

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data } = await supabase
    .from("founder_emails")
    .select("email")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  return !!data;
}