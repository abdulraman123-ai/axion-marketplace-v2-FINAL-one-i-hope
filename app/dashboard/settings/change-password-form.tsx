"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "saving" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentPassword.trim()) {
      setError("Enter your current password.");
      setStatus("error");
      return;
    }

    if (password.length < 6) {
      setError("New password must be at least 6 characters.");
      setStatus("error");
      return;
    }

    if (password !== confirm) {
      setError("New passwords don't match.");
      setStatus("error");
      return;
    }

    setStatus("verifying");

    try {
      const supabase = createClient();

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email ?? "",
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error("Current password is incorrect.");
      }

      setStatus("saving");

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setCurrentPassword("");
      setPassword("");
      setConfirm("");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Current password
        </label>
        <Input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          New password
        </label>
        <Input
          type="password"
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
        <Input
          type="password"
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
        <p className="text-sm text-success">Password updated.</p>
      )}

      <div>
        <Button type="submit" disabled={status === "verifying" || status === "saving"}>
          {status === "verifying" ? "Verifying..." : status === "saving" ? "Updating..." : "Update password"}
        </Button>
      </div>
    </form>
  );
}