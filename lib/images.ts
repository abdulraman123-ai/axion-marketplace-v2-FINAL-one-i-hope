import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

const SIGNED_URL_TTL = 3600;

export async function resolveProductImageUrl(
  imageUrl: string | null | undefined
): Promise<string | null> {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (!imageUrl.startsWith("product-files/")) return imageUrl;

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) return imageUrl;

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
  const { data } = await serviceClient.storage
    .from("product-files")
    .createSignedUrl(imageUrl, SIGNED_URL_TTL);

  return data?.signedUrl ?? imageUrl;
}
