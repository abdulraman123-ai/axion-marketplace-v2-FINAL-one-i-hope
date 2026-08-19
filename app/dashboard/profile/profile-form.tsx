"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  userId,
  email,
  initialFullName,
  initialAvatarUrl,
}: {
  userId: string;
  email: string;
  initialFullName: string;
  initialAvatarUrl: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq("id", userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setStatus("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Email
        </label>
        <Input
          value={email}
          disabled
          aria-describedby="email-hint"
          className="opacity-60"
        />
        <p id="email-hint" className="mt-2 text-xs text-text-secondary">
          Your email is managed by your authentication provider and can't
          be changed here.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Full name
        </label>
        <Input
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Avatar URL
        </label>
        <Input
          placeholder="https://..."
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          autoComplete="url"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {status === "done" && (
        <p className="text-sm text-success">Profile saved.</p>
      )}

      <div>
        <Button type="submit" disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}