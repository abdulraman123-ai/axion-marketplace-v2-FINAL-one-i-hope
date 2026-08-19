import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface AuditLogEntry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  actor_user_id: string | null;
}

export default async function AdminAuditLogsPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let logs: AuditLogEntry[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
    const { data } = await serviceClient
      .from("audit_logs")
      .select("id, action, target_type, target_id, metadata, created_at, actor_user_id")
      .order("created_at", { ascending: false })
      .limit(100);

    logs = (data ?? []) as AuditLogEntry[];
  }

  return (
    <FounderConsolePage>
      <ConsoleCard
        title="Audit Logs"
        eyebrow="History"
        action={
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
            {logs.length} entry{logs.length === 1 ? "" : "s"}
          </span>
        }
      >
        {logs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No audit logs yet</p>
            <p className="mt-2 text-sm text-text-secondary">Admin actions will be recorded here.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-1 rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary">{log.action}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-text-secondary">
                  Target: {log.target_type ?? "—"} / {log.target_id ?? "—"}
                </p>
                {Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-surface p-3 text-xs text-text-secondary">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </ConsoleCard>
    </FounderConsolePage>
  );
}
