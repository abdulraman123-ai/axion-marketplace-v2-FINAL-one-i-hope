import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface RoleWithCount {
  id: string;
  name: string;
  description: string | null;
  user_count: number;
}

export default async function AdminRolesPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let roles: RoleWithCount[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const { data: rolesData } = await serviceClient
      .from("roles")
      .select("id, name, description, user_roles(count)");

    roles = (rolesData ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      user_count: r.user_roles?.[0]?.count ?? 0,
    }));
  }

  return (
    <FounderConsolePage>
      <ConsoleCard title="Roles" eyebrow="Authorization">
        {roles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No roles found</p>
            <p className="mt-2 text-sm text-text-secondary">Roles are managed through the role system.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{role.name}</p>
                  <p className="text-sm text-text-secondary">{role.description ?? "—"}</p>
                  <p className="text-xs text-text-secondary">{role.user_count} user{role.user_count === 1 ? "" : "s"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ConsoleCard>
    </FounderConsolePage>
  );
}
