"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function redirectIfAuthenticated() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const redirectTo = next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";

        if (redirectTo.startsWith("/admin")) {
          const { data: roles } = await supabase.rpc("user_role_names");
          const roleNames = (roles as string[]) || [];
          if (!roleNames.includes("admin")) {
            window.location.href = "/dashboard";
            return;
          }
        } else if (redirectTo.startsWith("/dashboard")) {
          const { data: roles } = await supabase.rpc("user_role_names");
          const roleNames = (roles as string[]) || [];
          if (roleNames.includes("admin")) {
            window.location.href = "/admin/dashboard";
            return;
          }
        }

        window.location.href = redirectTo;
      }
    }
    redirectIfAuthenticated();
  }, [next]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      const redirectTo = next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/dashboard";

      if (redirectTo.startsWith("/admin")) {
        const { data: roles } = await supabase.rpc("user_role_names");
        const roleNames = (roles as string[]) || [];
        if (!roleNames.includes("admin")) {
          window.location.href = "/dashboard";
          return;
        }
      } else if (redirectTo.startsWith("/dashboard")) {
        const { data: roles } = await supabase.rpc("user_role_names");
        const roleNames = (roles as string[]) || [];
        if (roleNames.includes("admin")) {
          window.location.href = "/admin/dashboard";
          return;
        }
      }

      window.location.href = redirectTo;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Sign in
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          aria-label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          aria-label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-text-secondary">
        <Link href="/forgot-password" className="text-accent underline">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-accent underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
