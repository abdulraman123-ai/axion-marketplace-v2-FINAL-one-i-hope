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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: {
    name?: unknown;
    slug?: unknown;
    description?: unknown;
    imageUrl?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, slug, description, imageUrl } = body;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Slug is required." }, { status: 400 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }
  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { error } = await serviceClient
    .from("categories")
    .update({
      name: name.trim(),
      slug: slug.trim(),
      description: typeof description === "string" ? description : null,
      image_url: typeof imageUrl === "string" && imageUrl ? imageUrl : null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A category with this slug already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }

  await logAuditEvent({
    action: "category_updated",
    actorUserId: user?.id ?? null,
    targetType: "category",
    targetId: id,
    metadata: { name: typeof name === "string" ? name : null, slug: typeof slug === "string" ? slug : null },
  });

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

  await serviceClient.from("categories").delete().eq("id", id);

  await logAuditEvent({
    action: "category_deleted",
    actorUserId: user?.id ?? null,
    targetType: "category",
    targetId: id,
  });

  return NextResponse.json({ success: true });
}
