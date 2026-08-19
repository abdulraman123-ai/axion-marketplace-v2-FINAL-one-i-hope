import { createClient } from "@/lib/supabase/server";
import { SiteNav } from "@/components/site-nav";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export const metadata: Metadata = {
  title: "Categories | Axion Marketplace",
  description: "Browse products by category on Axion Marketplace.",
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description")
    .order("name");

  const categoryList = (categories ?? []) as Category[];

  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-16 sm:px-12 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            Browse by category
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-text-primary sm:text-5xl">
            Categories
          </h1>
          <p className="mt-4 text-base leading-7 text-text-secondary sm:text-lg">
            Explore our curated collections of digital products.
          </p>
        </div>

        {categoryList.length === 0 ? (
          <div className="mt-12 rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-6 py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No categories yet</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Check back later for curated collections.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {categoryList.map((category) => (
              <a
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 transition-all duration-200 hover:border-accent/30"
              >
                <h2 className="text-xl font-semibold text-text-primary group-hover:text-accent">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {category.description}
                  </p>
                )}
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-text-secondary">
                  /{category.slug}
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
