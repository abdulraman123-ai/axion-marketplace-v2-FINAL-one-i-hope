import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { getCurrentUserRoles } from "@/lib/admin";

export async function logAuditEvent(params: {
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return;
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const { data: { user } } = await serviceClient.auth.getUser();

  await serviceClient.from("audit_logs").insert({
    actor_user_id: user?.id ?? null,
    action: params.action,
    target_type: params.targetType ?? null,
    target_id: params.targetId ?? null,
    metadata: params.metadata ?? {},
  });
}
