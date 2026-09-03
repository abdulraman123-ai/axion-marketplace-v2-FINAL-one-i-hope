import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { logAuditEvent } from "@/lib/audit";

export async function PUT(
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

  let body: {
    name?: unknown;
    description?: unknown;
    shortSummary?: unknown;
    priceCents?: unknown;
    imageUrl?: unknown;
    downloadUrl?: unknown;
    screenshots?: unknown;
    categoryId?: unknown;
    isComingSoon?: unknown;
    isPublished?: unknown;
    isFeatured?: unknown;
    version?: unknown;
    changelog?: unknown;
    docUrl?: unknown;
    supportUrl?: unknown;
    lemonSqueezyVariantId?: unknown;
    previewUrl?: unknown;
    selarUrl?: unknown;
    slug?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, description, shortSummary, priceCents, imageUrl, downloadUrl, screenshots, categoryId, isComingSoon, isPublished, isFeatured, version, changelog, docUrl, supportUrl, lemonSqueezyVariantId, previewUrl, selarUrl, slug } = body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof priceCents !== "number" ||
    !Number.isFinite(priceCents) ||
    priceCents <= 0
  ) {
    return NextResponse.json(
      { error: "Name and a valid price are required." },
      { status: 400 }
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }
  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const updatePayload: Record<string, any> = {
    name: name.trim(),
    description: typeof description === "string" ? description : null,
    short_summary: typeof shortSummary === "string" ? shortSummary : null,
    price_cents: priceCents,
    image_url: typeof imageUrl === "string" && imageUrl ? imageUrl : null,
    category_id: typeof categoryId === "string" && categoryId ? categoryId : null,
    is_published: !!isPublished,
    is_coming_soon: !!isComingSoon,
    is_featured: !!isFeatured,
    version: typeof version === "string" && version ? version : "1.0.0",
    changelog: typeof changelog === "string" ? changelog : null,
    documentation_url: typeof docUrl === "string" ? docUrl : null,
    support_url: typeof supportUrl === "string" && supportUrl ? supportUrl : null,
    screenshots: Array.isArray(screenshots) ? screenshots : [],
  };

  if (typeof slug === "string" && slug.trim()) {
    updatePayload.slug = slug.trim();
  }

  if (typeof lemonSqueezyVariantId === "string" && lemonSqueezyVariantId.trim()) {
    updatePayload.lemon_squeezy_variant_id = lemonSqueezyVariantId.trim();
  }

  if (typeof previewUrl === "string" && previewUrl.trim()) {
    updatePayload.preview_url = previewUrl.trim();
  }

  let validatedSelarUrl: string | null = null;
  if (typeof selarUrl === "string" && selarUrl.trim()) {
    const trimmed = selarUrl.trim();
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") {
        return NextResponse.json(
          { error: "Selar URL must use HTTPS." },
          { status: 400 }
        );
      }
      const host = parsed.hostname.toLowerCase();
      if (host !== "selar.com" && !host.endsWith(".selar.com")) {
        return NextResponse.json(
          { error: "Selar URL must be from the selar.com domain." },
          { status: 400 }
        );
      }
      validatedSelarUrl = parsed.toString();
    } catch {
      return NextResponse.json(
        { error: "Selar URL must be a valid HTTPS URL." },
        { status: 400 }
      );
    }
  }

  if (validatedSelarUrl !== null) {
    updatePayload.selar_url = validatedSelarUrl;
  }

  const { error: productError } = await serviceClient
    .from("products")
    .update(updatePayload)
    .eq("id", id);

  if (productError) {
    if (productError.code === "23505") {
      return NextResponse.json(
        { error: "A product with this name already exists. Please use a different name." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }

  if (typeof downloadUrl === "string" && downloadUrl.trim()) {
    const trimmed = downloadUrl.trim();
    let storagePath = trimmed;

    if (trimmed.startsWith("product-files/")) {
      storagePath = trimmed;
    } else {
      let parsedDownloadUrl: URL;
      try {
        parsedDownloadUrl = new URL(trimmed);
      } catch {
        return NextResponse.json(
          { error: "Download link must be a valid URL or storage path." },
          { status: 400 }
        );
      }

      if (parsedDownloadUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Download link must use HTTPS." },
          { status: 400 }
        );
      }

      storagePath = parsedDownloadUrl.toString();
    }

    const { error: fileError } = await serviceClient
      .from("product_files")
      .update({ storage_path: storagePath })
      .eq("product_id", id);

    if (fileError) {
      return NextResponse.json({ error: "Failed to update download file." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }
  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { data: product } = await serviceClient
    .from("products")
    .select("name")
    .eq("id", id)
    .single();

  await serviceClient.from("product_files").delete().eq("product_id", id);
  await serviceClient.from("products").delete().eq("id", id);

  await logAuditEvent({
    action: "product_deleted",
    actorUserId: user?.id ?? null,
    targetType: "product",
    targetId: id,
    metadata: { name: product?.name ?? null },
  });

  return NextResponse.json({ success: true });
}
