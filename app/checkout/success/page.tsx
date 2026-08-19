import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout Success | Axion Marketplace",
  description: "Your order has been received.",
};

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-1 flex-col justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Payment received
      </h1>
      <p className="mt-4 text-text-secondary">
        Your payment is being confirmed. Once confirmed, your purchase will appear in your dashboard and you&apos;ll be able to download your files.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/dashboard/purchases">
          <Button size="lg" className="w-full">
            View my purchases
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg" className="w-full">
            Continue shopping
          </Button>
        </Link>
      </div>
    </main>
  );
}
