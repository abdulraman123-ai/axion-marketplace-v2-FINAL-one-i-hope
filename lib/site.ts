// Centralized site URL helper.
// Uses NEXT_PUBLIC_SITE_URL when configured; otherwise falls back to the
// production domain. This is safe for use in server components and email
// templates because the value is a public-facing origin, not a secret.
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://voxkit-app.vercel.app");
  if (!process.env.NEXT_PUBLIC_SITE_URL && process.env.NODE_ENV === "production") {
    console.warn(
      "NEXT_PUBLIC_SITE_URL is not set. Using VoxKit fallback domain. " +
        "Set NEXT_PUBLIC_SITE_URL in your deployment environment before launch for correct absolute URLs."
    );
  }
  return siteUrl;
}
