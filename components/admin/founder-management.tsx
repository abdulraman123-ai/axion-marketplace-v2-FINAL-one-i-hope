"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Founder {
  email: string;
  created_at: string;
}

export function FounderManagement({ founders }: { founders: Founder[] }) {
  const [email, setEmail] = useState("");
  const [list, setList] = useState(founders);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/founders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to add founder.");
      }

      setList((current) => [
        ...current,
        { email: email.toLowerCase(), created_at: new Date().toISOString() },
      ]);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <ul className="flex flex-col gap-2">
        {list.map((founder) => (
          <li
            key={founder.email}
            className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-text-primary"
          >
            <span>{founder.email}</span>
            <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-text-secondary">
              Founder
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Founder email"
          required
          type="email"
          placeholder="friend@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          type="submit"
          disabled={loading}
          variant="outline"
          className="w-full sm:w-auto sm:shrink-0"
        >
          {loading ? "Adding..." : "Add founder"}
        </Button>
      </form>
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-xs leading-6 text-text-secondary">
        Add a friend&apos;s email here before they can access this page —
        they still need to sign up for an account with that same email
        first.
      </p>
    </div>
  );
}
