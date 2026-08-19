// GET /api/downloads/[productId] — serves the downloadable file(s) for a
// product the signed-in customer has legitimately purchased.
//
// SECURITY BOUNDARY: this route deliberately uses the REGULAR cookie client
// (not the service role key) for the file lookup. The product_files RLS
// policy only returns a row if this exact signed-in user has a completed
// order for this exact product. If they haven't paid, the query comes back
// empty — not because this route checked and said no, but because the
// database itself won't show it to them. That is the real security boundary.
//
// Download access is logged to download_records (server-side) so the admin
// Downloads module has real telemetry.

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // A product can have more than one file (e.g. versioned releases). We
  // return the most recently uploaded file so customers always get the
  // latest version. We select up to one row (the newest) so a product with
  // multiple files doesn't cause .maybeSingle() to throw.
  const { data: files, error: fileQueryError } = await supabase
    .from("product_files")
    .select("id, storage_path, file_name")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fileQueryError) {
    console.error("Failed to look up download file:", fileQueryError);
    return NextResponse.json(
      { error: "Could not look up this download." },
      { status: 500 }
    );
  }

  const file = files?.[0];

  if (!file) {
    return NextResponse.json(
      {
        error:
          "You don't have access to this file. Have you purchased this product?",
      },
      { status: 403 }
    );
  }

  // Log the download event server-side. We use the service-role client here
  // because the download_records table intentionally has no user INSERT
  // policy (customers must not be able to fabricate download history). The
  // insert is best-effort — a logging failure must never block delivery.
  try {
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (supabaseUrl && serviceRoleKey) {
      const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
      await serviceClient.from("download_records").insert({
        user_id: user.id,
        product_id: productId,
        file_id: file.id,
      });
    }
  } catch (err) {
    console.error("Failed to log download (non-fatal):", err);
  }

  // If the storage_path looks like a Supabase Storage path (starts with the
  // bucket name), generate a short-lived signed URL. Otherwise treat it as
  // an external HTTPS URL and redirect directly.
  const storagePath = file.storage_path;
  if (storagePath.startsWith("product-files/")) {
    const supabaseUrl = getSupabaseUrl();
    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (supabaseUrl && serviceRoleKey) {
      const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
      const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
        .from("product-files")
        .createSignedUrl(storagePath, 60);

      if (signedUrlError) {
        console.error("Failed to create signed URL:", signedUrlError);
        return NextResponse.json(
          { error: "Storage is not configured yet. Please contact support." },
          { status: 500 }
        );
      }

      if (!signedUrlData?.signedUrl) {
        return NextResponse.json(
          { error: "Download is not available right now." },
          { status: 500 }
        );
      }

      return NextResponse.redirect(signedUrlData.signedUrl);
    }

    return NextResponse.json(
      { error: "Storage is not configured yet. Please contact support." },
      { status: 500 }
    );
  }

  try {
    const downloadUrl = new URL(storagePath);
    if (downloadUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "The download link for this product is invalid." },
        { status: 400 }
      );
    }

    return NextResponse.redirect(downloadUrl);
  } catch {
    return NextResponse.json(
      { error: "The download link for this product is invalid." },
      { status: 500 }
    );
  }
}
