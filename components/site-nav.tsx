import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileMenu } from "@/components/mobile-menu";

export const dynamic = "force-dynamic";

export async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-full px-3 py-2 transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
        <MobileMenu user={user} />
      </div>
    </header>
  );
}