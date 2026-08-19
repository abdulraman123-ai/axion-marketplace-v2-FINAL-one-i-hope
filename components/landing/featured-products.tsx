import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface FeaturedProduct {
  id: string;
  name: string;
  description: string | null;
  short_summary: string | null;
}

export async function FeaturedProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, short_summary")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(2);

  const featured = (products ?? []) as FeaturedProduct[];

  if (featured.length === 0) {
    return null;
  }

  return (
    <section id="featured-products" className="border-b border-border/80 px-6 py-24 sm:px-12 lg:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            Featured products
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-4xl">
            Products built to help teams work more clearly.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
            Browse the most immediately useful AXION products for organizing, delivering,
            and running operations with less friction.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {featured.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-[1.35rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_22px_70px_rgba(0,0,0,0.28)]"
            >
              <div className="border-b border-border/70 bg-surface-elevated/55 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                    Flagship product
                  </span>
                  <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
                  {product.name}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
                  {product.short_summary ?? product.description ?? "A premium digital product from AXION."}
                </p>
              </div>
              <div className="grid gap-px bg-border/70 sm:grid-cols-3">
                {["Problem", "System", "Launch"].map((label) => (
                  <div key={label} className="bg-surface p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary">
                      {label}
                    </p>
                    <div className="mt-4 h-2 rounded-full bg-surface-elevated">
                      <div className="h-full w-3/4 rounded-full bg-accent/60 transition-all group-hover:w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/70 px-4 py-2 text-sm font-semibold text-accent transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary"
        >
          View full catalog
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
