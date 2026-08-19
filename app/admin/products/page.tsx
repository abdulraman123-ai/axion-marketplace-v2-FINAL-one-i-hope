import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import Link from "next/link";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  is_published: boolean;
  is_featured: boolean;
  is_coming_soon: boolean;
  version: string;
  created_at: string;
  updated_at: string;
  categories: { name: string; slug: string }[];
}

interface AdminProductsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const { search, status } = await searchParams;

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let products: AdminProduct[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
    let query = serviceClient
      .from("products")
      .select("id, name, slug, price_cents, is_published, is_featured, is_coming_soon, version, created_at, updated_at, categories(name, slug)")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status === "published") {
      query = query.eq("is_published", true);
    } else if (status === "draft") {
      query = query.eq("is_published", false);
    } else if (status === "featured") {
      query = query.eq("is_featured", true);
    } else if (status === "coming-soon") {
      query = query.eq("is_coming_soon", true);
    }

    const { data } = await query;
    products = (data ?? []) as AdminProduct[];
  }

  const statusCounts = {
    all: products.length,
    published: products.filter((p) => p.is_published).length,
    draft: products.filter((p) => !p.is_published).length,
    featured: products.filter((p) => p.is_featured).length,
    "coming-soon": products.filter((p) => p.is_coming_soon).length,
  };

  return (
    <FounderConsolePage>
      <ConsoleCard
        title="Products"
        action={
          <Link href="/admin/products/new">
            <Button size="sm">Add Product</Button>
          </Link>
        }
      >
        <form method="GET" action="/admin/products" className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search products..."
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-xs"
          />
          <select
            name="status"
            defaultValue={status ?? "all"}
            className="h-10 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="all">All ({statusCounts.all})</option>
            <option value="published">Published ({statusCounts.published})</option>
            <option value="draft">Draft ({statusCounts.draft})</option>
            <option value="featured">Featured ({statusCounts.featured})</option>
            <option value="coming-soon">Coming Soon ({statusCounts["coming-soon"]})</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>

        {products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No products found</p>
            <p className="mt-2 text-sm text-text-secondary">Try adjusting your search or create a new product.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-text-primary">{product.name}</p>
                    {product.is_featured && (
                      <span className="rounded-full border border-accent/20 bg-accent-subtle px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                        Featured
                      </span>
                    )}
                    {product.is_coming_soon && (
                      <span className="rounded-full border border-warning/20 bg-warning-subtle px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-warning">
                        Coming Soon
                      </span>
                    )}
                    {!product.is_published && (
                      <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    ${(product.price_cents / 100).toFixed(2)} · {product.categories?.[0]?.name ?? "Uncategorized"} · v{product.version}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Updated {new Date(product.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </ConsoleCard>
    </FounderConsolePage>
  );
}
