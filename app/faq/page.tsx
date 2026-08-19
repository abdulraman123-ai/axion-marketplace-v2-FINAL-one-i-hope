import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function FaqPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Frequently Asked Questions
        </h1>
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-6">
            <h2 className="text-lg font-semibold text-text-primary">
              How do I access my purchases?
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              After purchasing a product, you can access it from your dashboard
              under the Purchases section. Downloads are available there.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-6">
            <h2 className="text-lg font-semibold text-text-primary">
              Can I use these products commercially?
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Each product includes its own license terms. Please review the
              license information included with your purchase.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-6">
            <h2 className="text-lg font-semibold text-text-primary">
              How do I get support?
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Each product page includes a support link if the creator has
              provided one. You can also reach out through the product
              documentation.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/products">
            <Button>Browse products</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
