import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { notFound } from "next/navigation";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CustomerWithPurchases {
  id: string;
  email: string | null;
  created_at: string;
  full_name: string | null;
  orders: {
    id: string;
    created_at: string;
    total_cents: number;
    status: string;
  }[];
}

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCustomerDetailPage({ params }: AdminCustomerDetailPageProps) {
  const { id } = await params;
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    notFound();
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { data: authUsers } = await serviceClient.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  const authUser = authUsers?.users.find((u: any) => u.id === id);

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("id", id)
    .single();

  const { data: orders } = await serviceClient
    .from("orders")
    .select("id, created_at, total_cents, status")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const customer: CustomerWithPurchases = {
    id,
    email: authUser?.email ?? null,
    created_at: profile?.created_at ?? authUser?.created_at ?? "",
    full_name: profile?.full_name ?? null,
    orders: (orders ?? []) as CustomerWithPurchases["orders"],
  };

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Customer</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary">
              {customer.full_name ?? customer.email ?? "—"}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {customer.email ?? "—"} · Joined {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
          <Link href="/admin/customers">
            <Button variant="outline">Back to customers</Button>
          </Link>
        </div>

        <ConsoleCard title="Orders" eyebrow="History">
          {customer.orders.length === 0 ? (
            <p className="text-sm text-text-secondary">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-surface-elevated"
                >
                  <div>
                    <p className="font-medium text-text-primary">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {(order.total_cents / 100).toFixed(2)} · {order.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}
