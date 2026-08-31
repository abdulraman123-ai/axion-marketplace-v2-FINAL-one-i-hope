// Centralized site URL helper.
// Uses NEXT_PUBLIC_SITE_URL when configured; otherwise falls back to the
// production domain. This is safe for use in server components and email
// templates because the value is a public-facing origin, not a secret.
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://axion-marketplace-v2-final-one-i-ho.vercel.app";
  if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === "production") {
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not set. Using fallback domain. " +
        "Set NEXT_PUBLIC_SITE_URL in your deployment environment for correct absolute URLs."
    );
  }
  return siteUrl;
}
