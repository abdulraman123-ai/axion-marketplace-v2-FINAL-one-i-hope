"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BuyButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfig, setNeedsConfig] = useState(false);

  async function handleBuy() {
    if (disabled) return;
    setLoading(true);
    setError(null);
    setNeedsConfig(false);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/sign-in?next=/products";
          return;
        }
        if (response.status === 500 && data.error?.includes("isn't configured yet")) {
          setNeedsConfig(true);
          return;
        }
        throw new Error(data.error ?? "Something went wrong.");
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (needsConfig) {
    return (
      <div className="rounded-xl border border-warning/30 bg-warning-subtle p-4 text-sm text-warning">
        Payments are not configured yet. This product will be available for
        purchase once payment credentials are added.
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={handleBuy}
        disabled={disabled || loading}
        size="lg"
        className="w-full"
      >
        {disabled ? "Coming Soon" : loading ? "Starting checkout..." : "Buy Now"}
      </Button>
      {error && <p className="mt-3 max-w-sm text-sm text-danger">{error}</p>}
    </div>
  );
}
