import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-text-primary">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">404</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Page not found</h1>
      <p className="mt-4 max-w-md text-base text-text-secondary">
        The page you requested could not be found. Return to the catalog to continue exploring Axion products.
      </p>
      <Link href="/products" className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
        Browse products
      </Link>
    </main>
  );
}
