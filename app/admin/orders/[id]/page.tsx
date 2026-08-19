import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { notFound } from "next/navigation";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OrderWithItems {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  currency: string;
  customer_email: string | null;
  updated_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    price_cents: number;
    products: { name: string; slug: string } | null;
  }[];
}

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    notFound();
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { data: order } = await serviceClient
    .from("orders")
    .select(
      `id, created_at, status, total_cents, currency, customer_email, updated_at,
       order_items ( id, product_id, product_name, price_cents, products ( name, slug ) )`
    )
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const typedOrder = order as unknown as OrderWithItems;

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Order</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary">
              {typedOrder.id.slice(0, 8)}...
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {new Date(typedOrder.created_at).toLocaleDateString()} ·{" "}
              {typedOrder.currency?.toUpperCase()} {(typedOrder.total_cents / 100).toFixed(2)}
            </p>
          </div>
          <Link href="/admin/orders">
            <Button variant="outline">Back to orders</Button>
          </Link>
        </div>

        <ConsoleCard title="Customer">
          <p className="text-sm text-text-secondary">
            {typedOrder.customer_email ?? "—"}
          </p>
          <p className="text-xs text-text-secondary">
            Updated {new Date(typedOrder.updated_at).toLocaleDateString()}
          </p>
        </ConsoleCard>

        <ConsoleCard title="Items">
          <div className="mt-4 space-y-4">
            {typedOrder.order_items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-text-primary">
                    {item.products?.name ?? item.product_name}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {(item.price_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}
