import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface RevenueByProduct {
  name: string;
  orders: number;
  revenue: number;
}

interface AdminRevenuePageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminRevenuePage({ searchParams }: AdminRevenuePageProps) {
  const { range = "all" } = await searchParams;
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let totalRevenue = 0;
  let totalOrders = 0;
  let averageOrderValue = 0;
  let revenueByProduct: RevenueByProduct[] = [];
  let recentOrders: Array<{ id: string; created_at: string; total_cents: number; currency: string; customer_email: string | null }> = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    let dateFilter: { column: string; value: Date } | null = null;

    if (range === "7d") {
      dateFilter = { column: "created_at", value: new Date(now.setDate(now.getDate() - 7)) };
    } else if (range === "30d") {
      dateFilter = { column: "created_at", value: new Date(now.setDate(now.getDate() - 30)) };
    } else if (range === "90d") {
      dateFilter = { column: "created_at", value: new Date(now.setDate(now.getDate() - 90)) };
    }

    let ordersQuery = serviceClient.from("orders").select("id, created_at, total_cents, currency, customer_email");
    let revenueQuery = serviceClient.from("orders").select("total_cents");

    if (dateFilter) {
      ordersQuery = ordersQuery.gte(dateFilter.column, dateFilter.value.toISOString());
      revenueQuery = revenueQuery.gte(dateFilter.column, dateFilter.value.toISOString());
    }

    const [{ data: orders }, { data: revenueOrders }] = await Promise.all([
      ordersQuery.order("created_at", { ascending: false }).limit(50),
      revenueQuery,
    ]);

    const revenueCents = (revenueOrders ?? []).reduce((sum: number, o: any) => sum + (o.total_cents ?? 0), 0);
    totalRevenue = revenueCents / 100;
    totalOrders = (revenueOrders ?? []).length;
    averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    recentOrders = (orders ?? []).map((o: any) => ({
      id: o.id,
      created_at: o.created_at,
      total_cents: o.total_cents,
      currency: o.currency,
      customer_email: o.customer_email,
    }));

    const { data: orderItems } = await serviceClient
      .from("order_items")
      .select("product_id, price_cents, products(name)");

    const productMap = new Map<string, { name: string; orders: number; revenue: number }>();
    for (const item of orderItems ?? []) {
      const pid = (item as any).product_id;
      const name = (item as any).products?.name ?? "Unknown";
      const existing = productMap.get(pid) ?? { name, orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += (item as any).price_cents ?? 0;
      productMap.set(pid, existing);
    }

    revenueByProduct = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-text-secondary">Revenue</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary">
            Revenue overview
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            All values come from actual order data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <ConsoleCard title="Total revenue" eyebrow="Lifetime">
            <p className="text-2xl font-semibold text-text-primary">${totalRevenue.toFixed(2)}</p>
          </ConsoleCard>
          <ConsoleCard title="Orders" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{totalOrders}</p>
          </ConsoleCard>
          <ConsoleCard title="Average order" eyebrow="Value">
            <p className="text-2xl font-semibold text-text-primary">${averageOrderValue.toFixed(2)}</p>
          </ConsoleCard>
        </div>

        <ConsoleCard title="Revenue by product" eyebrow="Top products">
          {revenueByProduct.length === 0 ? (
            <p className="text-sm text-text-secondary">No revenue data yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {revenueByProduct.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="font-medium text-text-primary">{product.name}</p>
                    <p className="text-sm text-text-secondary">
                      {product.orders} sale{product.orders === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text-primary">
                    ${(product.revenue / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ConsoleCard>

        <ConsoleCard title="Recent orders" eyebrow="Commerce">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-text-secondary">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-xl border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {order.customer_email ?? "—"} · {order.currency?.toUpperCase()} {(order.total_cents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}
