import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalDownloads: number;
  totalProducts: number;
  publishedProducts: number;
  topProducts: Array<{ name: string; orders: number; revenue: number }>;
  dailyStats: Array<{ date: string; orders: number; revenue: number }>;
}

interface AdminAnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const { range = "all" } = await searchParams;
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let analytics: AnalyticsData = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalDownloads: 0,
    totalProducts: 0,
    publishedProducts: 0,
    topProducts: [],
    dailyStats: [],
  };

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

    let ordersQuery = serviceClient.from("orders").select("*", { count: "exact", head: true });
    let revenueQuery = serviceClient.from("orders").select("total_cents");
    let customersQuery = serviceClient.from("profiles").select("*", { count: "exact", head: true });
    let downloadsQuery = serviceClient.from("download_records").select("*", { count: "exact", head: true });
    let productsQuery = serviceClient.from("products").select("*", { count: "exact", head: true });
    let publishedQuery = serviceClient.from("products").select("*", { count: "exact", head: true }).eq("is_published", true);

    if (dateFilter) {
      ordersQuery = ordersQuery.gte(dateFilter.column, dateFilter.value.toISOString());
      revenueQuery = revenueQuery.gte(dateFilter.column, dateFilter.value.toISOString());
    }

    const [
      { count: ordersCount },
      { count: customersCount },
      { count: productsCount },
      { count: publishedCount },
      { count: downloadsCount },
      { data: revenueOrders },
    ] = await Promise.all([
      ordersQuery,
      customersQuery,
      productsQuery,
      publishedQuery,
      downloadsQuery,
      revenueQuery,
    ]);

    const { data: topProductsData } = await serviceClient
      .from("order_items")
      .select("product_id, price_cents, products(name)");

    const productMap = new Map<string, { name: string; orders: number; revenue: number }>();
    for (const item of topProductsData ?? []) {
      const pid = (item as any).product_id;
      const name = (item as any).products?.name ?? "Unknown";
      const existing = productMap.get(pid) ?? { name, orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += (item as any).price_cents ?? 0;
      productMap.set(pid, existing);
    }

    const totalRevenueCents = (revenueOrders ?? []).reduce(
      (sum: number, o: any) => sum + (o.total_cents ?? 0),
      0
    );

    analytics = {
      totalRevenue: totalRevenueCents / 100,
      totalOrders: ordersCount ?? 0,
      totalCustomers: customersCount ?? 0,
      totalDownloads: downloadsCount ?? 0,
      totalProducts: productsCount ?? 0,
      publishedProducts: publishedCount ?? 0,
      topProducts: Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10),
      dailyStats: [],
    };
  }

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-text-secondary">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary">
            Performance overview
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Key metrics for your marketplace. All values come from the database.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <ConsoleCard title="Revenue" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">${analytics.totalRevenue.toFixed(2)}</p>
          </ConsoleCard>
          <ConsoleCard title="Orders" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{analytics.totalOrders}</p>
          </ConsoleCard>
          <ConsoleCard title="Customers" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{analytics.totalCustomers}</p>
          </ConsoleCard>
          <ConsoleCard title="Downloads" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{analytics.totalDownloads}</p>
          </ConsoleCard>
          <ConsoleCard title="Products" eyebrow="Total">
            <p className="text-2xl font-semibold text-text-primary">{analytics.totalProducts}</p>
          </ConsoleCard>
          <ConsoleCard title="Published" eyebrow="Products">
            <p className="text-2xl font-semibold text-text-primary">{analytics.publishedProducts}</p>
          </ConsoleCard>
        </div>

        <ConsoleCard title="Top products" eyebrow="By revenue">
          {analytics.topProducts.length === 0 ? (
            <p className="text-sm text-text-secondary">No sales data yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {analytics.topProducts.map((product, index) => (
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
      </div>
    </FounderConsolePage>
  );
}
