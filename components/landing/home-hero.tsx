import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80">
      <div className="hero-grid-bg hero-radial-fade absolute inset-0 opacity-40" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />

      <div className="relative mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-7xl items-center gap-12 px-6 py-20 sm:px-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-28 xl:gap-16">
        <div className="max-w-3xl animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur">
            <Layers3 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Premium systems for modern teams
          </span>

          <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.035em] text-text-primary sm:text-5xl lg:text-7xl">
            Practical digital products that help teams move faster.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
            Explore AXION’s catalog of premium products for operations, delivery,
            and day-to-day execution. Each release is designed to be useful from
            the first use.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="press-scale inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_40px_rgba(59,130,246,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
            >
              Shop the catalog
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#featured-products"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border/70 bg-surface/80 px-6 text-sm font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-elevated"
            >
              See featured products
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span className="rounded-full border border-border/70 bg-surface/70 px-3 py-1.5">
              Built for real workflows
            </span>
            <span className="rounded-full border border-border/70 bg-surface/70 px-3 py-1.5">
              Designed to be useful quickly
            </span>
            <span className="rounded-full border border-border/70 bg-surface/70 px-3 py-1.5">
              Maintained after release
            </span>
          </div>
        </div>

        <div className="animate-scale-in lg:justify-self-end">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(180deg,rgba(17,17,17,0.95),rgba(10,10,10,0.94))] shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur">
            <div className="border-b border-border bg-surface-elevated/70 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success" />
                </div>
                <span className="text-xs text-text-secondary">
                  AXION Product System
                </span>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-6">
              <div className="rounded-xl border border-border bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-secondary">
                      Research
                    </p>
                    <p className="mt-2 text-lg font-semibold text-text-primary">
                      Business problem mapping
                    </p>
                  </div>
                  <span className="rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
                    Active
                  </span>
                </div>
                <div className="mt-5 grid gap-2">
                  <span className="h-2 rounded-full bg-surface-elevated" />
                  <span className="h-2 w-4/5 rounded-full bg-surface-elevated" />
                  <span className="h-2 w-2/3 rounded-full bg-surface-elevated" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {["Design", "Build", "Review", "Maintain"].map((stage) => (
                  <div
                    key={stage}
                    className="rounded-xl border border-border bg-background/60 p-4"
                  >
                    <p className="text-sm font-medium text-text-primary">
                      {stage}
                    </p>
                    <div className="mt-4 h-1.5 rounded-full bg-surface-elevated">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-accent to-success" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-background/60 p-4">
                <div className="flex flex-wrap gap-2">
                  {["Systems", "Templates", "AI", "Code", "Courses"].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
