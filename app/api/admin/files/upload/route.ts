import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;
  const version = formData.get("version") as string | null;
  const fileLabel = formData.get("fileLabel") as string | null;

  if (!file || !productId) {
    return NextResponse.json({ error: "File and product ID are required." }, { status: 400 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const fileExt = file.name.split(".").pop() ?? "bin";
  const filePath = `product-files/products/${productId}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await serviceClient.storage
    .from("product-files")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }

  const { error: dbError } = await serviceClient.from("product_files").insert({
    product_id: productId,
    file_name: fileLabel ?? file.name,
    storage_path: filePath,
    file_size: file.size,
    version: version ?? null,
  });

  if (dbError) {
    await serviceClient.storage.from("product-files").remove([filePath]);
    return NextResponse.json({ error: "Failed to save file record." }, { status: 500 });
  }

  await logAuditEvent({
    action: "product_file_uploaded",
    targetType: "product_file",
    targetId: productId,
    metadata: { file_name: file.name, file_size: file.size, version },
  });

  return NextResponse.json({ success: true, path: filePath });
}
