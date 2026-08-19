import { createClient as createServiceClient } from "@supabase/supabase-js";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { AddProductForm } from "@/components/admin/add-product-form";
import { notFound } from "next/navigation";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/env";

interface ProductWithFiles {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_summary: string | null;
  price_cents: number;
  image_url: string | null;
  category_id: string | null;
  is_published: boolean;
  is_coming_soon: boolean;
  is_featured: boolean;
  version: string;
  changelog: string | null;
  documentation_url: string | null;
  support_url: string | null;
  lemon_squeezy_variant_id: string | null;
  preview_url: string | null;
  screenshots: string[];
  product_files: { storage_path: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    notFound();
  }

  const serviceClient = createServiceClient(supabaseUrl, serviceRoleKey);

  const [{ data: product }, { data: categories }] = await Promise.all([
    serviceClient
      .from("products")
      .select("*, product_files(storage_path)")
      .eq("id", id)
      .single(),
    serviceClient
      .from("categories")
      .select("id, name, slug")
      .order("name"),
  ]);

  if (!product) {
    notFound();
  }

  const typedProduct = product as ProductWithFiles;
  const categoryList = (categories ?? []) as Category[];

  const initialData = {
    id: typedProduct.id,
    name: typedProduct.name,
    slug: typedProduct.slug,
    description: typedProduct.description,
    short_summary: typedProduct.short_summary,
    price_cents: typedProduct.price_cents,
    image_url: typedProduct.image_url,
    category_id: typedProduct.category_id,
    is_published: typedProduct.is_published,
    is_coming_soon: typedProduct.is_coming_soon,
    is_featured: typedProduct.is_featured,
    version: typedProduct.version,
    changelog: typedProduct.changelog,
    documentation_url: typedProduct.documentation_url,
    support_url: typedProduct.support_url,
    lemon_squeezy_variant_id: typedProduct.lemon_squeezy_variant_id,
    preview_url: typedProduct.preview_url,
    screenshots: typedProduct.screenshots,
    download_url: typedProduct.product_files?.[0]?.storage_path ?? "",
  };

  return (
    <FounderConsolePage>
      <ConsoleCard title="Edit product">
        <AddProductForm initialData={initialData} categories={categoryList} />
      </ConsoleCard>
    </FounderConsolePage>
  );
}
