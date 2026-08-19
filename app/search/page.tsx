import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/components/site-nav";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export const metadata: Metadata = {
  title: "Search | Axion Marketplace",
  description: "Search digital products on Axion Marketplace.",
};

export default async function SearchPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient();
  const { q, category } = await searchParams;

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name"),
    (async () => {
      let query = supabase
        .from("products")
        .select(
          "id, name, slug, description, short_summary, price_cents, category_id, is_featured, is_coming_soon, image_url, categories(name, slug)"
        )
        .eq("is_published", true);

      if (q) {
        const term = `%${q}%`;
        query = query.or(
          `name.ilike.${term},short_summary.ilike.${term},description.ilike.${term}`
        );
      }

      if (category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();

        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      return query.order("created_at", { ascending: false });
    })(),
  ]);

  const categoryList = (categories ?? []) as Array<{ id: string; name: string; slug: string }>;
  const productList = (products ?? []) as Array<any>;

  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:px-12 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            Search
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-text-primary sm:text-5xl">
            {q ? `Results for "${q}"` : "Search products"}
          </h1>
        </div>

        <form
          method="GET"
          action="/search"
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search products..."
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:max-w-xs"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-10 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">All categories</option>
            {categoryList.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button type="submit">Search</Button>
        </form>

        {productList.length === 0 ? (
          <div className="mt-12 rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No products found</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Try adjusting your search or browse the full catalog.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {productList.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                description={product.short_summary ?? product.description}
                priceCents={product.price_cents}
                badge={
                  product.is_coming_soon
                    ? "Coming Soon"
                    : product.is_featured
                      ? "Featured"
                      : undefined
                }
                category={product.categories?.name}
                imageUrl={product.image_url ?? undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
