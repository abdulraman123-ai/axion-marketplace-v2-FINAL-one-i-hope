import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRoles } from "@/lib/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { logAuditEvent } from "@/lib/audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id: targetId } = await params;

  if (!targetId || targetId === user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 }
    );
  }

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server storage not configured." },
      { status: 500 }
    );
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(
    targetId
  );

  if (deleteError) {
    console.error("Failed to delete user:", deleteError);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }

  await logAuditEvent({
    action: "user_deleted",
    actorUserId: user.id,
    targetType: "user",
    targetId: targetId,
    metadata: { deleted_user_id: targetId },
  });

  return NextResponse.json({ success: true });
}
