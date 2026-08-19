import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Downloads | Axion Marketplace",
  description: "Download files from products you've purchased.",
};

interface OrderItem {
  product_id: string | null;
  products: { name: string; slug: string } | null;
}

interface OrderWithItems {
  id: string;
  created_at: string;
  order_items: OrderItem[];
}

export default async function DownloadsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(`id, created_at, order_items ( product_id, products ( name, slug ) )`)
    .eq("user_id", user.id)
    .in("status", ["paid", "completed"])
    .order("created_at", { ascending: false })
    .limit(100);

  const orders = (data ?? []) as unknown as OrderWithItems[];

  // Deduplicate: a customer may have multiple orders of the same product, or
  // the product may exist in multiple orders. We show each distinct product
  // once, with its download link.
  const seen = new Set<string>();
  const downloads = orders
    .flatMap((o) =>
      o.order_items.map((item) => ({
        productId: item.product_id,
        name: item.products?.name ?? "Product",
        purchasedAt: o.created_at,
      }))
    )
    .filter((d) => {
      if (!d.productId || seen.has(d.productId)) return false;
      seen.add(d.productId);
      return true;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          My Downloads
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Files you can download for products you own.
        </p>
      </div>

      {downloads.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-surface/70 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Nothing to download yet
          </p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Once you buy a product, its downloadable files will appear here.
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
          {downloads.map((d) => (
            <div
              key={d.productId}
              className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface/70 px-6 py-4"
            >
              <div>
                <p className="font-medium text-text-primary">{d.name}</p>
                <p className="text-sm text-text-secondary">
                  Purchased {new Date(d.purchasedAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/api/downloads/${d.productId}`}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}