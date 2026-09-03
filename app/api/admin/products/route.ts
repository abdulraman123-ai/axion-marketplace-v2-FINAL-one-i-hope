import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { name, description, shortSummary, priceCents, imageUrl, downloadUrl, screenshots, categoryId, isComingSoon, isPublished, isFeatured, version, changelog, docUrl, supportUrl, lemonSqueezyVariantId, previewUrl, selarUrl } = body;

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

  const slugValue = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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

  const { data: product, error: productError } = await serviceClient
    .from("products")
    .insert({
      name: name.trim(),
      slug: slugValue,
      description: typeof description === "string" && description ? description : null,
      short_summary: typeof shortSummary === "string" && shortSummary ? shortSummary : null,
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
      lemon_squeezy_variant_id: typeof lemonSqueezyVariantId === "string" && lemonSqueezyVariantId ? lemonSqueezyVariantId : null,
      preview_url: typeof previewUrl === "string" && previewUrl ? previewUrl : null,
      selar_url: validatedSelarUrl,
      screenshots: Array.isArray(screenshots) ? screenshots : [],
    })
    .select()
    .single();

  if (productError) {
    if (productError.code === "23505") {
      return NextResponse.json(
        { error: "A product with this name already exists. Please use a different name." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }

  const storagePath =
    typeof downloadUrl === "string" && downloadUrl.trim() ? downloadUrl.trim() : slugValue;

  const { error: fileError } = await serviceClient
    .from("product_files")
    .insert({
      product_id: product.id,
      storage_path: storagePath,
      file_name: name.trim(),
    });

  if (fileError) {
    return NextResponse.json({ error: "Failed to attach download file." }, { status: 500 });
  }

  await logAuditEvent({
    action: "product_created",
    actorUserId: user?.id ?? null,
    targetType: "product",
    targetId: product.id,
    metadata: { name: product.name, price_cents: priceCents },
  });

  return NextResponse.json({ success: true, product });
}
