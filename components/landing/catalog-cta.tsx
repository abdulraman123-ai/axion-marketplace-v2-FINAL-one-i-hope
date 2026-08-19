import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CatalogCta() {
  return (
    <section className="px-6 py-24 sm:px-12 lg:py-28">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-6 py-16 text-center shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:px-10 lg:px-14">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-secondary">
          Explore the catalog
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-text-primary sm:text-5xl">
          Choose the product that matches the way your team works.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary">
          Browse the current catalog for practical systems and assets that support day-to-day work.
        </p>
        <Link
          href="/products"
          className="press-scale mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_40px_rgba(59,130,246,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
        >
          Explore products
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
