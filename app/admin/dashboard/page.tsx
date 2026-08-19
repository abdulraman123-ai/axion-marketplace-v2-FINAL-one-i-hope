import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  publishedProducts: number;
  totalDownloads: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  total_cents: number;
  currency: string;
  customer_email: string | null;
  status: string;
}

interface RecentCustomer {
  id: string;
  email: string | null;
  created_at: string;
  full_name: string | null;
}

export default async function AdminDashboardPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let stats: AdminStats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    publishedProducts: 0,
    totalDownloads: 0,
  };

  let recentOrders: RecentOrder[] = [];
  let recentCustomers: RecentCustomer[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const [
      { count: ordersCount },
      { count: customersCount },
      { count: productsCount },
      { count: publishedCount },
      { count: downloadsCount },
      { data: revenueOrders },
    ] = await Promise.all([
      serviceClient.from("orders").select("*", { count: "exact", head: true }),
      serviceClient.from("profiles").select("*", { count: "exact", head: true }),
      serviceClient.from("products").select("*", { count: "exact", head: true }),
      serviceClient
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),
      serviceClient.from("download_records").select("*", { count: "exact", head: true }),
      serviceClient.from("orders").select("total_cents"),
    ]);

    const { data: orders } = await serviceClient
      .from("orders")
      .select("id, created_at, total_cents, currency, customer_email, status")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: authUsers } = await serviceClient.auth.admin.listUsers({
      page: 1,
      perPage: 5,
    });

    const totalRevenueCents = (revenueOrders ?? []).reduce(
      (sum: number, o: any) => sum + (o.total_cents ?? 0),
      0
    );

    stats = {
      totalRevenue: totalRevenueCents / 100,
      totalOrders: ordersCount ?? 0,
      totalCustomers: customersCount ?? 0,
      totalProducts: productsCount ?? 0,
      publishedProducts: publishedCount ?? 0,
      totalDownloads: downloadsCount ?? 0,
    };

    recentOrders = (orders ?? []) as RecentOrder[];
    recentCustomers = (profiles ?? []).map((p: any) => ({
      id: p.id,
      email: authUsers?.users.find((u: any) => u.id === p.id)?.email ?? null,
      created_at: p.created_at,
      full_name: p.full_name,
    }));
  }

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <ConsoleCard title="Revenue" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">${stats.totalRevenue.toFixed(2)}</p>
          </ConsoleCard>
          <ConsoleCard title="Orders" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{stats.totalOrders}</p>
          </ConsoleCard>
          <ConsoleCard title="Customers" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{stats.totalCustomers}</p>
          </ConsoleCard>
          <ConsoleCard title="Products" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{stats.totalProducts}</p>
          </ConsoleCard>
          <ConsoleCard title="Published" eyebrow="Products">
            <p className="text-2xl font-semibold text-text-primary">{stats.publishedProducts}</p>
          </ConsoleCard>
          <ConsoleCard title="Downloads" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{stats.totalDownloads}</p>
          </ConsoleCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ConsoleCard title="Recent orders" eyebrow="Commerce">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-text-secondary">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {order.customer_email ?? "—"} · {order.currency?.toUpperCase()} {(order.total_cents / 100).toFixed(2)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${order.status === "completed" || order.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-elevated text-text-secondary"}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ConsoleCard>

          <ConsoleCard title="Recent customers" eyebrow="Retention">
            {recentCustomers.length === 0 ? (
              <p className="text-sm text-text-secondary">No customers yet.</p>
            ) : (
              <div className="space-y-3">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {customer.full_name ?? "—"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {customer.email ?? "—"} · Joined {new Date(customer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ConsoleCard>
        </div>
      </div>
    </FounderConsolePage>
  );
}
