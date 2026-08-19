import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { SiteNav } from "@/components/site-nav";
import type { Metadata } from "next";

interface CategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_summary: string | null;
    price_cents: number;
    image_url: string | null;
    is_featured: boolean;
    is_coming_soon: boolean;
    categories: { name: string; slug: string } | null;
  }[];
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) {
    return { title: "Category not found | Axion Marketplace" };
  }

  return {
    title: `${category.name} | Axion Marketplace`,
    description: category.description ?? `Browse ${category.name} products on Axion Marketplace.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug, description, products(id, name, slug, description, short_summary, price_cents, image_url, is_featured, is_coming_soon, categories(name, slug))")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  const typedCategory = category as CategoryWithProducts;
  const products = (typedCategory.products ?? []).filter((p) => p.id);

  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:px-12 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            Category
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-text-primary sm:text-5xl">
            {typedCategory.name}
          </h1>
          {typedCategory.description && (
            <p className="mt-4 text-base leading-7 text-text-secondary sm:text-lg">
              {typedCategory.description}
            </p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="mt-12 rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No products in this category</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Check back later or browse the full catalog.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
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
