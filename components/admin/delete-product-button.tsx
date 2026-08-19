"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete product.");
      }

      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <p className="text-sm text-success">Product deleted.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!confirmed && !error && (
        <p className="text-xs text-text-secondary">
          This will permanently remove &quot;{productName}&quot; and its files. Order history will be preserved with product references cleared.
        </p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-danger hover:text-danger"
      >
        {loading ? "Deleting..." : "Delete product"}
      </Button>
    </div>
  );
}
