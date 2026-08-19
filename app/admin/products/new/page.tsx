import { createClient as createServiceClient } from "@supabase/supabase-js";
import { AddProductForm } from "@/components/admin/add-product-form";
import { FounderManagement } from "@/components/admin/founder-management";
import { ConsoleShell } from "@/components/admin/console-shell";
import { ConsoleCard } from "@/components/admin/console-card";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";
import type { Metadata } from "next";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const metadata: Metadata = {
  title: "Add a Product | Axion Marketplace",
  description: "Admin product administration for Axion Marketplace.",
};

export default async function AdminNewProductPage() {
  const user = await getCurrentUser();

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  const serviceClient =
    supabaseUrl && serviceRoleKey
      ? createServiceClient(supabaseUrl, serviceRoleKey)
      : null;

  const [{ data: founders }, { data: categories }] = await Promise.all([
    serviceClient
      ? serviceClient
          .from("founder_emails")
          .select("email, created_at")
          .order("created_at", { ascending: true })
      : { data: [] as any[] },
    serviceClient
      ? serviceClient
          .from("categories")
          .select("id, name, slug")
          .order("name")
      : { data: [] as Category[] },
  ]);

  return (
    <ConsoleShell>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ConsoleCard
          title="Create product"
          action={
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
              Admin access
            </span>
          }
        >
          <p className="text-sm leading-7 text-text-secondary">
            Signed in as {user?.email}. This workspace is restricted to
            administrators.
          </p>
          <div className="mt-5">
            <AddProductForm categories={categories ?? []} />
          </div>
        </ConsoleCard>

        <ConsoleCard title="Legacy founders">
          <p className="text-sm leading-7 text-text-secondary">
            Legacy owner allowlist — kept for compatibility. Admin roles are
            now managed through the role system.
          </p>
          <div className="mt-5">
            <FounderManagement founders={founders ?? []} />
          </div>
        </ConsoleCard>
      </div>
    </ConsoleShell>
  );
}
