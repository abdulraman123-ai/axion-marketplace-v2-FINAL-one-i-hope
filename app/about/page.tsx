import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-12">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] text-text-primary">
          About Axion
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          AXION builds and maintains premium digital products for modern teams.
          Our marketplace is designed to help teams move with clarity, providing
          practical systems, templates, and assets for business operations and
          execution.
        </p>
        <div className="mt-8">
          <Link href="/products">
            <Button>Browse products</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
