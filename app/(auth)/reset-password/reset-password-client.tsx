"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);

  useEffect(() => {
    async function exchangeCode() {
      if (!code) {
        setIsValidSession(false);
        return;
      }

      setIsExchanging(true);
      const supabase = createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setIsValidSession(false);
      } else {
        setIsValidSession(true);
      }
      setIsExchanging(false);
    }

    exchangeCode();
  }, [code]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setStatus("error");
      return;
    }

    if (password !== confirm) {
      setError("Passwords don't match.");
      setStatus("error");
      return;
    }

    setStatus("saving");

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setPassword("");
      setConfirm("");
      setStatus("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password."
      );
      setStatus("error");
    }
  }

  if (isExchanging) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-1 flex-col justify-center px-6">
        <p className="text-sm text-text-secondary">Verifying reset link...</p>
      </main>
    );
  }

  if (isValidSession === false) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-1 flex-col justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Invalid or expired reset link
        </h1>
        <p className="mt-4 text-text-secondary">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Request new reset link
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-elevated"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            New password
          </label>
          <PasswordInput
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Confirm new password
          </label>
          <PasswordInput
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {status === "done" && (
          <p className="text-sm text-success">Password updated. You can now sign in.</p>
        )}
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Updating..." : "Update password"}
        </Button>
      </form>
      {status === "done" && (
        <p className="mt-6 text-sm text-text-secondary">
          <Link href="/sign-in" className="text-accent underline">
            Go to sign in
          </Link>
        </p>
      )}
    </main>
  );
}
