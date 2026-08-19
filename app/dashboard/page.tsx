import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Axion Marketplace",
  description: "Your Axion Marketplace account overview.",
};

interface OrderItem {
  product_id: string | null;
  products?: { name: string; slug: string } | null;
}

interface OrderWithItems {
  id: string;
  created_at: string;
  total_cents: number;
  status: string;
  order_items: OrderItem[];
}

export default async function DashboardOverviewPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `id, created_at, total_cents, status,
       order_items ( product_id, products ( name, slug ) )`
    )
    .eq("user_id", user.id)
    .in("status", ["paid", "completed"])
    .order("created_at", { ascending: false })
    .limit(100);

  const completedOrders = (orders ?? []) as unknown as OrderWithItems[];
  const totalSpentCents = completedOrders.reduce(
    (sum, o) => sum + (o.total_cents ?? 0),
    0
  );
  const distinctProducts = new Set(
    completedOrders.flatMap((o) =>
      o.order_items.map((i) => i.product_id)
    )
  ).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Signed in as {user.email}. Here's a snapshot of your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
          <p className="text-sm text-text-secondary">Orders</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {completedOrders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
          <p className="text-sm text-text-secondary">Products owned</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {distinctProducts}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
          <p className="text-sm text-text-secondary">Total spent</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            ${(totalSpentCents / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface/70 p-5">
        <h2 className="text-lg font-semibold text-text-primary">Get started</h2>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link
            href="/products"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Browse products
          </Link>
          {completedOrders.length > 0 && (
            <Link
              href="/dashboard/downloads"
              className="inline-flex w-fit items-center gap-2 text-accent underline"
            >
              View your downloads
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}