import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { FileUploadForm } from "@/components/admin/file-upload-form";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface FileRow {
  id: string;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  version: string | null;
  created_at: string;
  updated_at: string;
  products: { name: string; slug: string }[] | null;
}

interface ProductOption {
  id: string;
  name: string;
}

export default async function AdminFilesPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let files: FileRow[] = [];
  let products: ProductOption[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const [{ data: filesData }, { data: productsData }] = await Promise.all([
      serviceClient
        .from("product_files")
        .select("id, file_name, storage_path, file_size, version, created_at, updated_at, products(name, slug)")
        .order("created_at", { ascending: false }),
      serviceClient
        .from("products")
        .select("id, name")
        .order("name"),
    ]);

    files = (filesData ?? []) as FileRow[];
    products = (productsData ?? []) as ProductOption[];
  }

  return (
    <FounderConsolePage>
      <ConsoleCard
        title="Product Files"
        eyebrow="Storage"
        action={
          <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
            {files.length} file{files.length === 1 ? "" : "s"}
          </span>
        }
      >
        <FileUploadForm products={products} />

        {files.length === 0 ? (
          <div className="mt-6 py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No files uploaded</p>
            <p className="mt-2 text-sm text-text-secondary">Files attached to products will appear here.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{file.file_name}</p>
                  <p className="text-sm text-text-secondary">
                    {file.products?.[0]?.name ?? "Unknown product"} · v{file.version ?? "—"}
                    {file.file_size ? ` · ${(file.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="sm:flex-shrink-0">
                  <span className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-secondary">
                    Private storage
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ConsoleCard>
    </FounderConsolePage>
  );
}
