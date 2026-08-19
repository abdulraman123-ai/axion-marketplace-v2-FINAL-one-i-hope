import Link from "next/link";

export interface ProductCardProps {
  slug: string;
  name: string;
  description?: string | null;
  priceCents: number;
  badge?: string;
  category?: string;
  imageUrl?: string;
}

export function ProductCard({
  slug,
  name,
  description,
  priceCents,
  badge,
  category,
  imageUrl,
}: ProductCardProps) {
  const hasDescription = Boolean(description && description.trim());
  const priceLabel = `$${(priceCents / 100).toFixed(2)}`;

  return (
    <Link
      href={`/products/${slug}`}
      className="group block overflow-hidden rounded-[1.35rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-[1px] shadow-[0_18px_60px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
    >
      <div className="overflow-hidden rounded-[1.3rem] bg-surface/95">
        {imageUrl ? (
          <div className="aspect-video w-full overflow-hidden border-b border-border/70 bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="px-6 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-surface-elevated text-accent shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-accent/30">
                <span className="text-lg font-semibold">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              {badge ? (
                <span className="rounded-full border border-accent/20 bg-accent-subtle px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
                  {badge}
                </span>
              ) : (
                <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-text-secondary">
                  Digital
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-4">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-text-primary transition-colors duration-200 group-hover:text-accent">
            {name}
          </h3>
          {category && (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-text-secondary">
              {category}
            </p>
          )}
          {hasDescription ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
              {description}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Product details will appear here once published.
            </p>
          )}
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/70 pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-text-secondary">
                Price
              </p>
              <p className="mt-1 text-xl font-semibold text-text-primary">
                {priceLabel}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-transform duration-200 group-hover:translate-x-1">
              View product
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
