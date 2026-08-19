import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  await supabase.auth.getUser();

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const fileExt = file.name.split(".").pop() ?? "bin";
  const assetType = type === "screenshot" ? "screenshots" : "thumbnail";
  const filePath = `product-files/products/${id}/assets/${assetType}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await serviceClient.storage
    .from("product-files")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }

  const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
    .from("product-files")
    .createSignedUrl(filePath, 31536000);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    await serviceClient.storage.from("product-files").remove([filePath]);
    return NextResponse.json({ error: "Failed to generate signed URL." }, { status: 500 });
  }

  await logAuditEvent({
    action: "product_asset_uploaded",
    targetType: "product",
    targetId: id,
    metadata: { file_name: file.name, file_size: file.size, type: assetType },
  });

  return NextResponse.json({ success: true, path: filePath, signedUrl: signedUrlData.signedUrl });
}
