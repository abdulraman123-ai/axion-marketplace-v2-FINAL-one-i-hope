import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";

interface CustomerRow {
  id: string;
  email: string | null;
  created_at: string;
  full_name: string | null;
}

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // auth.admin.listUsers() requires the service-role key. Use a separate
  // service-role client for this call only; keep the regular client for
  // the profiles query below (which is allowed via RLS for admins).
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const serviceClient = supabaseUrl && serviceRoleKey
    ? createServiceClient(supabaseUrl, serviceRoleKey)
    : null;

  const { data: users } = serviceClient
    ? await serviceClient.auth.admin.listUsers({ page: 1, perPage: 100 })
    : { data: { users: [] as Array<{ id: string; email: string | null; created_at: string }> } };

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, created_at");

  const profileList = (profiles ?? []) as Array<{ id: string; full_name: string | null; created_at: string | null }>;

  const profileMap = new Map(
    profileList.map((p) => [
      p.id,
      { fullName: p.full_name ?? null, createdAt: p.created_at ?? null },
    ])
  );

  const rows: CustomerRow[] = (users?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at:
      u.created_at ??
      profileMap.get(u.id)?.createdAt ??
      "",
    full_name: profileMap.get(u.id)?.fullName ?? null,
  }));

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <ConsoleCard
          title="Customers"
          eyebrow="Retention"
          action={
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
              {rows.length} customer{rows.length === 1 ? "" : "s"}
            </span>
          }
        >
          {rows.length === 0 ? (
            <div className="rounded-xl border border-border/70 bg-surface/50 px-6 py-12 text-center">
              <p className="text-lg font-semibold text-text-primary">
                No customers yet
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Customers will appear here once accounts are created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-xs uppercase tracking-[0.2em] text-text-secondary">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((customer) => (
                    <tr key={customer.id}>
                      <td className="py-3 pr-4 text-text-primary">
                        {customer.full_name ?? "—"}
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">
                        {customer.email ?? "—"}
                      </td>
                      <td className="py-3 text-text-secondary">
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}