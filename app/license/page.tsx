import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function LicensePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          License
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          Each product on Axion Marketplace is subject to its own license terms.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
          <p>
            Unless otherwise specified, products are licensed for personal or
            commercial use as described in the product listing. You may not
            resell, redistribute, or share purchased products with third parties.
          </p>
          <p>
            For specific license terms, refer to the documentation included with
            each product or contact the creator directly.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
