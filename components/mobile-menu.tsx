"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

interface MobileMenuProps {
  user: { email?: string } | null;
}

export function MobileMenu({ user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 text-sm text-text-primary"
        aria-label="Toggle menu"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav className="mt-2 space-y-1 rounded-2xl border border-border/70 bg-surface/80 p-4">
          <Link href="/products" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
            Shop
          </Link>
          <Link href="/categories" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
            Categories
          </Link>
          <Link href="/search" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
            Search
          </Link>
          <Link href="/about" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
            About
          </Link>
          <Link href="/contact" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
            Contact
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
                Sign in
              </Link>
              <Link href="/sign-up" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      )}
    </div>
  );
}
