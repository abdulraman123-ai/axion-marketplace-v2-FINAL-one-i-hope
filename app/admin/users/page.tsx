import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { UserDeleteButton } from "@/components/admin/user-delete-button";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface UserWithProfile {
  id: string;
  email: string | null;
  created_at: string;
  full_name: string | null;
  roles: string[];
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default async function AdminUsersPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let users: UserWithProfile[] = [];
  let allRoles: Role[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const [{ data: authUsers }, { data: profiles }, { data: userRoles }, { data: rolesData }] = await Promise.all([
      serviceClient.auth.admin.listUsers({ page: 1, perPage: 100 }),
      serviceClient.from("profiles").select("id, full_name, created_at"),
      serviceClient.from("user_roles").select("user_id, roles(name)"),
      serviceClient.from("roles").select("id, name, description"),
    ]);

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const roleMap = new Map<string, string[]>();
    for (const ur of userRoles ?? []) {
      const userId = (ur as any).user_id;
      const roleName = (ur as any).roles?.name;
      if (roleName) {
        roleMap.set(userId, [...(roleMap.get(userId) ?? []), roleName]);
      }
    }

    users = (authUsers?.users ?? []).map((u: any) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at ?? profileMap.get(u.id)?.created_at ?? "",
      full_name: profileMap.get(u.id)?.full_name ?? null,
      roles: roleMap.get(u.id) ?? [],
    }));

    allRoles = (rolesData ?? []) as Role[];
  }

  return (
    <FounderConsolePage>
      <ConsoleCard
        title="Users"
        eyebrow="Accounts"
        action={
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
            {users.length} user{users.length === 1 ? "" : "s"}
          </span>
        }
      >
        {users.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No users yet</p>
            <p className="mt-2 text-sm text-text-secondary">Users will appear here once accounts are created.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{user.full_name ?? "—"}</p>
                  <p className="text-sm text-text-secondary">{user.email ?? "—"}</p>
                  <p className="text-xs text-text-secondary">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <UserRoleManager userId={user.id} currentRoles={user.roles} allRoles={allRoles} />
                  <UserDeleteButton userId={user.id} userEmail={user.email} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ConsoleCard>
    </FounderConsolePage>
  );
}
