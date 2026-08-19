import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface DownloadRecord {
  id: string;
  created_at: string;
  user_id: string;
  product_id: string;
  file_id: string;
  profiles: { full_name: string | null }[] | null;
  products: { name: string }[] | null;
}

export default async function AdminDownloadsPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let downloads: DownloadRecord[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
    const { data } = await serviceClient
      .from("download_records")
      .select("id, created_at, user_id, product_id, file_id, profiles(full_name), products(name)")
      .order("created_at", { ascending: false })
      .limit(100);

    downloads = (data ?? []) as DownloadRecord[];
  }

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <ConsoleCard
          title="Recent downloads"
          eyebrow="Activity"
          action={
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
              {downloads.length} record{downloads.length === 1 ? "" : "s"}
            </span>
          }
        >
          {downloads.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-text-primary">No downloads yet</p>
              <p className="mt-2 text-sm text-text-secondary">Download activity will appear here once customers purchase products.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {downloads.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-1 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary">{record.products?.[0]?.name ?? "Unknown product"}</p>
                  <p className="text-sm text-text-secondary">
                    {record.profiles?.[0]?.full_name ?? "—"} · {new Date(record.created_at).toLocaleString()}
                  </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}
