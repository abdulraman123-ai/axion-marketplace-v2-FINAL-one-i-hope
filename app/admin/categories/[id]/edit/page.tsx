import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { CategoryForm } from "@/components/admin/category-form";
import { notFound } from "next/navigation";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

export default async function AdminEditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    notFound();
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);
  const { data: category } = await serviceClient
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("id", id)
    .single();

  if (!category) {
    notFound();
  }

  return (
    <FounderConsolePage>
      <ConsoleCard title="Edit category">
        <CategoryForm
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description ?? undefined,
            image_url: category.image_url ?? undefined,
          }}
        />
      </ConsoleCard>
    </FounderConsolePage>
  );
}
