"use client";

import { useState } from "react";

interface UserDeleteButtonProps {
  userId: string;
  userEmail: string | null;
}

export function UserDeleteButton({ userId, userEmail }: UserDeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const confirmed = window.confirm(
      `Delete user ${userEmail ?? userId}? This action cannot be undone.`
    );

    if (!confirmed) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete user.");
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:border-danger/60 hover:bg-danger/15 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
