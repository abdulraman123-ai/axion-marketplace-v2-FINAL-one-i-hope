import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  product_count: number;
}

export default async function AdminCategoriesPage() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  let categories: CategoryRow[] = [];

  if (supabaseUrl && serviceRoleKey) {
    const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

    const { data } = await serviceClient
      .from("categories")
      .select("id, name, slug, description, image_url, created_at, updated_at, products(count)")
      .order("name");

    categories = (data ?? []).map((cat: any) => ({
      ...cat,
      product_count: cat.products?.[0]?.count ?? 0,
    }));
  }

  return (
    <FounderConsolePage>
      <ConsoleCard
        title="Categories"
        eyebrow="Catalog"
        action={
          <Link href="/admin/categories/new">
            <Button size="sm">Add Category</Button>
          </Link>
        }
      >
        {categories.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-text-primary">No categories yet</p>
            <p className="mt-2 text-sm text-text-secondary">Create your first category to organize products.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text-primary">{category.name}</p>
                  <p className="text-sm text-text-secondary">
                    /{category.slug} · {category.product_count} product{category.product_count === 1 ? "" : "s"}
                  </p>
                  {category.description && (
                    <p className="mt-1 text-xs text-text-secondary">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </ConsoleCard>
    </FounderConsolePage>
  );
}
