// Server-side admin authorization. Never import from client components.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentUserRoles(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Secure RPC first (SECURITY DEFINER, locked search_path).
  const { data: roleNames, error } = await supabase.rpc("user_role_names");
  if (!error && Array.isArray(roleNames)) return roleNames as string[];

  // Fallback: direct query (RLS lets a user read their own roles).
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("roles(name)");
  if (userRoles) {
    const names = userRoles
      .map((r: { roles: { name: string } | null }) => r.roles?.name)
      .filter((n: string | undefined): n is string => typeof n === "string");
    if (names.length > 0) return names;
  }

  // Legacy fallback: founder_emails allowlist (kept for compatibility).
  const { isFounder } = await import("@/lib/founders");
  if (await isFounder(user.email)) return ["admin"];

  return [];
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) redirect("/products");

  return { user: { id: user.id, email: user.email } };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const roles = await getCurrentUserRoles();
  return roles.includes("admin");
}