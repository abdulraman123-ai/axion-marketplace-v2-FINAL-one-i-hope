import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Refund Policy
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          We want you to be satisfied with your purchase. Please review our
          refund policy below.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
          <p>
            Due to the digital nature of our products, refunds are generally not
            available once a product has been downloaded or accessed. However, if
            you have not downloaded the product and request a refund within 14
            days of purchase, we will consider your request.
          </p>
          <p>
            To request a refund, contact us with your order ID and the reason
            for your request. We will review and respond within a reasonable
            timeframe.
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
