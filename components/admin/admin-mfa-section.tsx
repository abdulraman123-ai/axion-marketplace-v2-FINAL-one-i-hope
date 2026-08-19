"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MfaStatus = "idle" | "loading" | "mfa_required" | "mfa_enrolled" | "error";

export function AdminSecuritySection() {
  const [status, setStatus] = useState<MfaStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<any[]>([]);
  const [totpCode, setTotpCode] = useState("");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFactors() {
      setStatus("loading");
      setError(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("You must be signed in to manage security settings.");
          setStatus("error");
          return;
        }

        const { data, error: listError } = await supabase.auth.mfa.listFactors();

        if (listError) {
          const message = listError.message.toLowerCase();
          if (message.includes("mfa") || message.includes("not enabled") || message.includes("not supported")) {
            setError("MFA is not enabled for this Supabase project. Enable Multi-Factor Authentication in your Supabase Dashboard > Authentication > MFA.");
          } else {
            setError(listError.message);
          }
          setStatus("error");
          return;
        }

        const enrolled = data?.totp.filter((f: any) => f.status === "verified") ?? [];

        if (enrolled.length > 0) {
          setFactors(enrolled);
          setStatus("mfa_enrolled");
        } else {
          setStatus("mfa_required");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load MFA status.");
        setStatus("error");
      }
    }

    loadFactors();
  }, []);

  async function handleEnroll(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const supabase = createClient();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Admin TOTP",
      });

      if (enrollError) {
        throw new Error(enrollError.message);
      }

      setQrUrl(data.totp.qr_code);
      setFactorId(data.id);
      setStatus("mfa_required");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start MFA enrollment.");
      setStatus("error");
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!factorId) {
      setError("Missing enrollment. Please start enrollment again.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const supabase = createClient();
      const { error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) {
        throw new Error(challengeError.message);
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        code: totpCode.trim(),
      });

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      setStatus("mfa_enrolled");
      setTotpCode("");
      setQrUrl(null);
      setFactorId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify MFA code.");
      setStatus("mfa_required");
    }
  }

  async function handleUnenroll(factorIdToRemove: string) {
    setError(null);
    setStatus("loading");

    try {
      const supabase = createClient();
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: factorIdToRemove,
      });

      if (unenrollError) {
        throw new Error(unenrollError.message);
      }

      setFactors((prev) => prev.filter((f) => f.id !== factorIdToRemove));
      setStatus(factors.length <= 1 ? "mfa_required" : "mfa_enrolled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove MFA factor.");
      setStatus("mfa_enrolled");
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-text-secondary">Loading security settings...</p>;
  }

  if (status === "error" && error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (status === "mfa_enrolled") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Multi-factor authentication</h3>
          <p className="mt-1 text-sm text-text-secondary">
            MFA is currently enabled. Removing it will reduce account security.
          </p>
        </div>

        <div className="space-y-3">
          {factors.map((factor) => (
            <div
              key={factor.id}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/70 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {factor.friendly_name ?? "TOTP"}
                </p>
                <p className="text-xs text-text-secondary">
                  Enrolled {new Date(factor.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnenroll(factor.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "mfa_required" && qrUrl) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Setup multi-factor authentication</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Scan this QR code with your authenticator app, then enter the code below.
          </p>
        </div>

        <div className="flex justify-center">
          <img
            src={qrUrl}
            alt="MFA QR code"
            className="h-48 w-48 rounded-xl border border-border/70 bg-white p-2"
          />
        </div>

        <form onSubmit={handleVerify} className="flex max-w-sm flex-col gap-4">
          <Input
            type="text"
            required
            placeholder="6-digit code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            inputMode="numeric"
            maxLength={6}
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" disabled={totpCode.length !== 6}>
            Verify and enable
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Multi-factor authentication</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Add a second factor to your admin account for stronger security.
        </p>
      </div>

      <form onSubmit={handleEnroll} className="flex max-w-sm flex-col gap-4">
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit">Enroll MFA</Button>
      </form>
    </div>
  );
}
