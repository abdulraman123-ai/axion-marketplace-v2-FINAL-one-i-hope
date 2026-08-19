import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function DisclaimerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Disclaimer
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          The information and products on this marketplace are provided on an
          &quot;as is&quot; basis.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
          <p>
            We make no warranties, expressed or implied, regarding the accuracy,
            reliability, or suitability of the products available through our
            marketplace.
          </p>
          <p>
            In no event shall Axion Marketplace be liable for any loss or damage
            arising from the use of products purchased through our platform.
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
