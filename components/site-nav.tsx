import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { AuthNavLinks } from "@/components/auth-nav-links";

export async function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-12 lg:py-5">
        <Link
          href="/"
          className="rounded-full border border-border/70 bg-surface/70 px-3 py-1.5 text-base font-semibold tracking-[-0.02em] text-text-primary transition-all duration-200 hover:border-accent/30 hover:text-accent"
        >
          AXION
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-2 text-sm text-text-secondary sm:flex sm:gap-4"
        >
          <Link href="/products" className="rounded-full px-3 py-2 transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary">
            Shop
          </Link>
          <Link href="/categories" className="rounded-full px-3 py-2 transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary">
            Categories
          </Link>
          <Link href="/search" className="rounded-full px-3 py-2 transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary">
            Search
          </Link>
          <Link href="/about" className="rounded-full px-3 py-2 transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary">
            About
          </Link>
          <AuthNavLinks />
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}
