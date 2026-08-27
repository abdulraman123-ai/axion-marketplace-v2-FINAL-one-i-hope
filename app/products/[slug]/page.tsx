import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/buy-button";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { cache } from "react";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  short_summary: string | null;
  price_cents: number;
  image_url: string | null;
  screenshots: string[];
  is_coming_soon: boolean;
  is_featured: boolean;
  version: string;
  changelog: string | null;
  documentation_url: string | null;
  support_url: string | null;
  preview_url: string | null;
  categories: { name: string; slug: string } | null;
}

const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, description, short_summary, price_cents, image_url, screenshots, is_coming_soon, is_featured, version, changelog, documentation_url, support_url, preview_url, categories(name, slug)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return product as ProductDetail | null;
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found | Axion Marketplace",
    };
  }

  return {
    title: `${product.name} | Axion Marketplace`,
    description:
      product.short_summary ??
      product.description ??
      "Premium digital product available from Axion Marketplace.",
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const displayDescription =
    product.short_summary ?? product.description ?? null;
  const screenshots = Array.isArray(product.screenshots)
    ? product.screenshots
    : [];

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-text-primary">
                {product.name}
              </h1>
              {product.is_featured && (
                <span className="rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                  Featured
                </span>
              )}
              {product.is_coming_soon && (
                <span className="rounded-full border border-warning/20 bg-warning-subtle px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-warning">
                  Coming Soon
                </span>
              )}
            </div>
            {product.categories && (
              <p className="mt-2 text-sm text-text-secondary">
                {product.categories.name}
              </p>
            )}
            {displayDescription && (
              <p className="mt-4 text-base leading-7 text-text-secondary">
                {displayDescription}
              </p>
            )}
          </div>

          {product.image_url && (
            <div className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-surface/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt={product.name}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {screenshots.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Screenshots
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {screenshots.map((src, index) => (
                  <div
                    key={src + index}
                    className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-surface/70"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.name} screenshot ${index + 1}`}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && product.short_summary && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text-primary">
                About this product
              </h2>
              <p className="whitespace-pre-line text-base leading-7 text-text-secondary">
                {product.description}
              </p>
            </div>
          )}

          {product.changelog && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text-primary">
                Changelog
              </h2>
              <p className="whitespace-pre-line text-sm leading-7 text-text-secondary">
                {product.changelog}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span>Version {product.version}</span>
            {product.preview_url && (
              <a
                href={product.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                Live Preview
              </a>
            )}
            {product.support_url && (
              <a
                href={product.support_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                Support
              </a>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[1.35rem] border border-border/70 bg-surface/70 p-6">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary">
                  Price
                </p>
                <p className="mt-1 text-3xl font-semibold text-text-primary">
                  ${(product.price_cents / 100).toFixed(2)}
                </p>
              </div>
              <span className="text-sm text-text-secondary">
                v{product.version}
              </span>
            </div>

            {product.is_coming_soon ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-text-secondary">
                  This product is coming soon. It isn&apos;t available for
                  purchase yet, but you can view the details.
                </p>
                <Button variant="outline" disabled className="w-full">
                  Coming Soon
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <BuyButton productId={product.id} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
