import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: {
    userId?: unknown;
    roleId?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { userId, roleId } = body;

  if (typeof userId !== "string" || !userId.trim()) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (typeof roleId !== "string" || !roleId.trim()) {
    return NextResponse.json({ error: "roleId is required." }, { status: 400 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { error } = await serviceClient
    .from("user_roles")
    .insert({
      user_id: userId.trim(),
      role_id: roleId.trim(),
    });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This user already has this role." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to assign role." }, { status: 500 });
  }

  await logAuditEvent({
    action: "role_assigned",
    targetType: "user_role",
    targetId: `${userId.trim()}:${roleId.trim()}`,
    metadata: { user_id: userId.trim(), role_id: roleId.trim() },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const roles = await getCurrentUserRoles();
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  let body: {
    userId?: unknown;
    roleId?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { userId, roleId } = body;

  if (typeof userId !== "string" || !userId.trim()) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  if (typeof roleId !== "string" || !roleId.trim()) {
    return NextResponse.json({ error: "roleId is required." }, { status: 400 });
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server storage not configured." }, { status: 500 });
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { error } = await serviceClient
    .from("user_roles")
    .delete()
    .eq("user_id", userId.trim())
    .eq("role_id", roleId.trim());

  if (error) {
    return NextResponse.json({ error: "Failed to remove role." }, { status: 500 });
  }

  await logAuditEvent({
    action: "role_removed",
    targetType: "user_role",
    targetId: `${userId.trim()}:${roleId.trim()}`,
    metadata: { user_id: userId.trim(), role_id: roleId.trim() },
  });

  return NextResponse.json({ success: true });
}
