import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          Terms of Service
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          By using Axion Marketplace, you agree to these terms. Please read them
          carefully.
        </p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-text-secondary">
          <p>
            You must be at least 18 years old to use our services. By creating
            an account or making a purchase, you represent that you are of legal
            age to enter into a binding agreement.
          </p>
          <p>
            All purchases are final unless otherwise stated in our refund policy.
            We reserve the right to refuse service to anyone for any reason at
            any time.
          </p>
          <p>
            We are not liable for any indirect, incidental, special,
            consequential, or punitive damages resulting from your use of our
            services.
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
