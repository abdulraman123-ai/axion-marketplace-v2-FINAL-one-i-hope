import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Cancelled | Axion Marketplace",
  description: "Your checkout was cancelled.",
};

export default function CheckoutCancelledPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-1 flex-col justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Checkout cancelled
      </h1>
      <p className="mt-4 text-text-secondary">
        Your payment was not completed. You can try again whenever you&apos;re ready.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/products">
          <Button size="lg" className="w-full">
            Browse products
          </Button>
        </Link>
        <Link href="/dashboard/purchases">
          <Button variant="outline" size="lg" className="w-full">
            View my purchases
          </Button>
        </Link>
      </div>
    </main>
  );
}
