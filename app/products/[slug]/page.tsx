import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BuyButton } from "@/components/buy-button";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";
import { cache } from "react";
import { resolveProductImageUrl } from "@/lib/images";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

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
  category_id: string | null;
  categories: { name: string; slug: string } | null;
}

interface ProductFile {
  id: string;
  file_name: string;
  file_size: number | null;
  version: string | null;
}

interface RelatedProduct {
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
}

const getProductBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, description, short_summary, price_cents, image_url, screenshots, is_coming_soon, is_featured, version, changelog, documentation_url, support_url, preview_url, category_id, categories(name, slug)"
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return product as ProductDetail | null;
});

async function getProductFiles(productId: string): Promise<ProductFile[]> {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) return [];

  const { createClient: createServiceClient } = await import("@supabase/supabase-js");
  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
  const { data } = await serviceClient
    .from("product_files")
    .select("id, file_name, file_size, version")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  return (data ?? []) as ProductFile[];
}

async function getRelatedProducts(
  productId: string,
  categoryId: string | null
): Promise<RelatedProduct[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, description, short_summary, price_cents, image_url, is_featured, is_coming_soon, categories(name, slug)"
    )
    .eq("is_published", true)
    .neq("id", productId)
    .limit(3);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query.order("created_at", { ascending: false });
  return (data ?? []) as RelatedProduct[];
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length <= 1) return "";
  return parts.pop()?.toUpperCase() ?? "";
}

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
  const resolvedImageUrl = (await resolveProductImageUrl(product.image_url)) ?? undefined;
  const resolvedScreenshots = (await Promise.all(
    screenshots.map((src) => resolveProductImageUrl(src))
  )).filter((src): src is string => src !== null);

  const [productFiles, relatedProducts] = await Promise.all([
    getProductFiles(product.id),
    product.categories
      ? getRelatedProducts(product.id, product.category_id)
      : Promise.resolve([]),
  ]);

  const resolvedRelatedProducts = await Promise.all(
    relatedProducts.map(async (p) => ({
      ...p,
      resolvedImageUrl: await resolveProductImageUrl(p.image_url),
    }))
  );

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-16 sm:px-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-8">
          <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <a href="/" className="hover:text-accent">Home</a>
              </li>
              {product.categories && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <a
                      href={`/categories/${product.categories.slug}`}
                      className="hover:text-accent"
                    >
                      {product.categories.name}
                    </a>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li className="text-text-primary" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>

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

          {resolvedImageUrl && (
            <div className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-surface/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolvedImageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {resolvedScreenshots.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Screenshots
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {resolvedScreenshots.map((src, index) => (
                  <div
                    key={src + index}
                    className="overflow-hidden rounded-[1.35rem] border border-border/70 bg-surface/70"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.name} screenshot ${index + 1}`}
                      loading="lazy"
                      decoding="async"
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

          {productFiles.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-text-primary">
                What&apos;s included
              </h2>
              <ul className="space-y-2">
                {productFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/70 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-text-primary">
                        {file.file_name}
                      </span>
                      {file.version && (
                        <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-text-secondary">
                          v{file.version}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary">
                      {getFileExtension(file.file_name) && (
                        <span className="text-[11px] uppercase tracking-[0.15em]">
                          {getFileExtension(file.file_name)}
                        </span>
                      )}
                      {formatFileSize(file.file_size) && (
                        <span className="text-xs">
                          {formatFileSize(file.file_size)}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <span>Version {product.version}</span>
            {product.preview_url && (
              <a
                href={product.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-subtle px-4 py-2 text-sm font-medium text-accent transition-colors hover:border-accent/50 hover:bg-accent-subtle/80"
              >
                <span aria-hidden="true">↗</span>
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
                <p className="mt-1 text-3xl font-semibold text-accent">
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

      {resolvedRelatedProducts.length > 0 && (
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            You may also like
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {resolvedRelatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                description={p.short_summary ?? p.description}
                priceCents={p.price_cents}
                badge={
                  p.is_coming_soon
                    ? "Coming Soon"
                    : p.is_featured
                      ? "Featured"
                      : undefined
                }
                category={p.categories?.name}
                imageUrl={p.resolvedImageUrl ?? undefined}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
