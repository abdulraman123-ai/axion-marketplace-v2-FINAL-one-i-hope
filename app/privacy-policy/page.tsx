import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Privacy Policy
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          Your privacy is important to us. This privacy policy explains how we
          collect, use, and protect your personal information when you use our
          marketplace.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
          <p>
            We collect information you provide directly to us, such as your name,
            email address, and payment information when you create an account or
            make a purchase.
          </p>
          <p>
            We use your information to provide and improve our services, process
            transactions, and communicate with you about your orders and account.
          </p>
          <p>
            We do not sell your personal information to third parties. We may
            share your information with service providers who assist us in
            operating our platform.
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
