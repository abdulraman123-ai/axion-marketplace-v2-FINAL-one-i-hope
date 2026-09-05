"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/sign-out-button";

export function AuthNavLinks() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <Link
          href="/sign-in"
          className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary"
        >
          Sign up
        </Link>
      </>
    );
  }

  if (user) {
    return (
      <>
        <Link
          href="/dashboard"
          className="rounded-full px-3 py-2 transition-all duration-200 hover:bg-surface-elevated hover:text-text-primary"
        >
          Dashboard
        </Link>
        <SignOutButton />
      </>
    );
  }

  return (
    <>
      <Link
        href="/sign-in"
        className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="rounded-full border border-border/70 bg-surface/70 px-3 py-2 transition-all duration-200 hover:border-accent/30 hover:bg-surface hover:text-text-primary"
      >
        Sign up
      </Link>
    </>
  );
}
