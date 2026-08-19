import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Purchases | Axion Marketplace",
  description: "View your Axion Marketplace purchases.",
};

interface OrderItem {
  product_id: string | null;
  price_cents: number;
  products: { name: string; slug: string } | null;
}

interface OrderWithItems {
  id: string;
  created_at: string;
  status: string;
  order_items: OrderItem[];
}

export default async function PurchasesPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  if (!user) {
    redirect("/sign-in");
  }

  const { data } = await supabase
    .from("orders")
    .select(
      `id, created_at, status,
       order_items ( product_id, price_cents, products ( name, slug ) )`
    )
    .eq("user_id", user.id)
    .in("status", ["paid", "completed"])
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = (data ?? []) as unknown as OrderWithItems[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          My Purchases
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Everything you've bought, with download access.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-surface/70 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-text-primary">
            No purchases yet
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Your purchases will appear here after you complete an order.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border/70 bg-surface/70 px-6 py-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">
                    Order {order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-text-secondary">
                    {new Date(order.created_at).toLocaleDateString()} ·{" "}
                    {order.status}
                  </p>
                </div>
                <Link
                  href={`/dashboard/purchases/${order.id}`}
                  className="rounded-lg border border-border/70 bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-accent/40 hover:text-accent"
                >
                  View order
                </Link>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {order.order_items.map((item) => (
                  <div
                    key={item.product_id ?? `${order.id}-${item.price_cents}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/60 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {item.products?.name ?? "Product"}
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
          ))}
        </div>
      )}
    </div>
  );
}