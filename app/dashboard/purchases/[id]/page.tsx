import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

interface OrderWithItems {
  id: string;
  created_at: string;
  status: string;
  total_cents: number;
  currency: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    price_cents: number;
    products: { name: string; slug: string } | null;
  }[];
}

interface PurchaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Details | Axion Marketplace",
  description: "View your order details.",
};

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const { id } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, created_at, status, total_cents, currency,
       order_items ( id, product_id, product_name, price_cents, products ( name, slug ) )`
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    notFound();
  }

  const typedOrder = order as unknown as OrderWithItems;

  return (
    <div className="space-y-6">
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

      <div className="rounded-2xl border border-border/70 bg-surface/70 p-6">
        <h2 className="text-lg font-semibold text-text-primary">Items</h2>
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
              {item.product_id && (
                <a
                  href={`/api/downloads/${item.product_id}`}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/purchases">
          <Button variant="outline">Back to purchases</Button>
        </Link>
        <Link href="/dashboard/downloads">
          <Button variant="outline">Downloads</Button>
        </Link>
      </div>
    </div>
  );
}
