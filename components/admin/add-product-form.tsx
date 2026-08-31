"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductFormProps {
  initialData?: any;
  categories?: Category[];
}

export function AddProductForm({ initialData, categories = [] }: AddProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [shortSummary, setShortSummary] = useState(initialData?.short_summary ?? "");
  const [price, setPrice] = useState(initialData ? (initialData.price_cents / 100).toString() : "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [downloadUrl, setDownloadUrl] = useState(initialData?.download_url ?? "");
  const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots ?? []);
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [isComingSoon, setIsComingSoon] = useState(initialData?.is_coming_soon ?? false);
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false);
  const [version, setVersion] = useState(initialData?.version ?? "1.0.0");
  const [changelog, setChangelog] = useState(initialData?.changelog ?? "");
  const [docUrl, setDocUrl] = useState(initialData?.documentation_url ?? "");
  const [supportUrl, setSupportUrl] = useState(initialData?.support_url ?? "");
  const [lemonSqueezyVariantId, setLemonSqueezyVariantId] = useState(initialData?.lemon_squeezy_variant_id ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialData?.preview_url ?? "");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [productFile, setProductFile] = useState<File | null>(null);

  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function uploadAsset(productId: string, file: File, type: "thumbnail" | "screenshot"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(`/api/admin/products/${productId}/upload-asset`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "Failed to upload asset.");
    }

      const data = await response.json();
      return data.path as string;
  }

  async function uploadProductFile(productId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", productId);

    const response = await fetch("/api/admin/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? "Failed to upload product file.");
    }

    const data = await response.json();
    return data.path as string;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      const productEndpoint = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
      const productResponse = await fetch(productEndpoint, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          description,
          shortSummary,
          priceCents: Math.round(parseFloat(price) * 100),
          imageUrl: imageUrl || null,
          downloadUrl: downloadUrl || null,
          screenshots: screenshots.filter(Boolean),
          categoryId: categoryId || null,
          isComingSoon,
          isPublished,
          isFeatured,
          version,
          changelog,
          docUrl,
          supportUrl,
          lemonSqueezyVariantId: lemonSqueezyVariantId || null,
          previewUrl: previewUrl || null,
        }),
      });

      if (!productResponse.ok) {
        const data = await productResponse.json();
        throw new Error(data.error ?? "Failed to save product.");
      }

      const productData = await productResponse.json();
      const productId = initialData?.id ?? productData.product.id;

      const updates: Record<string, any> = {};

      if (thumbnailFile) {
        const thumbnailUrl = await uploadAsset(productId, thumbnailFile, "thumbnail");
        updates.imageUrl = thumbnailUrl;
      }

      if (screenshotFiles.length > 0) {
        const screenshotUrls = await Promise.all(
          screenshotFiles.map((file) => uploadAsset(productId, file, "screenshot"))
        );
        updates.screenshots = screenshotUrls;
      }

      if (productFile) {
        const filePath = await uploadProductFile(productId, productFile);
        updates.downloadUrl = filePath;
      }

      if (Object.keys(updates).length > 0) {
        const updateResponse = await fetch(`/api/admin/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!updateResponse.ok) {
          const data = await updateResponse.json();
          throw new Error(data.error ?? "Failed to update product assets.");
        }
      }

      setStatus("done");
      if (!initialData) {
        setName("");
        setDescription("");
        setShortSummary("");
        setPrice("");
        setImageUrl("");
        setDownloadUrl("");
        setScreenshots([]);
        setCategoryId("");
        setIsComingSoon(false);
        setIsPublished(true);
        setIsFeatured(false);
        setVersion("1.0.0");
        setChangelog("");
        setDocUrl("");
        setSupportUrl("");
        setThumbnailFile(null);
        setScreenshotFiles([]);
        setProductFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Product name</label>
          <Input required placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Slug</label>
          <Input placeholder="product-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <p className="mt-1 text-xs text-text-secondary">Leave blank to auto-generate from the product name.</p>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-4 sm:col-span-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isComingSoon} onChange={(e) => setIsComingSoon(e.target.checked)} />
            Coming Soon
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Published
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Short Summary</label>
          <Input placeholder="Brief summary" value={shortSummary} onChange={(e) => setShortSummary(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Description</label>
          <textarea
            placeholder="Description (Markdown supported)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Changelog</label>
          <textarea
            placeholder="Changelog"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Price ($)</label>
          <Input required type="number" step="0.01" min="0" placeholder="19.99" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Version</label>
          <Input placeholder="1.0.0" value={version} onChange={(e) => setVersion(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Thumbnail Image</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
          />
          {(thumbnailFile || imageUrl) && (
            <p className="mt-1 text-xs text-text-secondary">
              {thumbnailFile ? thumbnailFile.name : `Current: ${imageUrl}`}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Product File</label>
          <Input
            type="file"
            onChange={(e) => setProductFile(e.target.files?.[0] ?? null)}
          />
          {(productFile || downloadUrl) && (
            <p className="mt-1 text-xs text-text-secondary">
              {productFile ? productFile.name : `Current: ${downloadUrl}`}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Preview Screenshots</label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setScreenshotFiles(Array.from(e.target.files ?? []))}
          />
          {(screenshotFiles.length > 0 || screenshots.length > 0) && (
            <p className="mt-1 text-xs text-text-secondary">
              {screenshotFiles.length > 0
                ? `${screenshotFiles.length} file(s) selected`
                : `${screenshots.length} existing`}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Docs URL</label>
          <Input placeholder="https://..." type="url" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Support URL</label>
          <Input placeholder="https://..." type="url" value={supportUrl} onChange={(e) => setSupportUrl(e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Preview/Demo URL</label>
          <Input placeholder="https://..." type="url" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-text-primary">Lemon Squeezy Variant ID</label>
          <Input placeholder="e.g. 123456" value={lemonSqueezyVariantId} onChange={(e) => setLemonSqueezyVariantId(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {status === "done" && <p className="text-sm text-success">Product saved.</p>}

      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : initialData ? "Update product" : "Create product"}
      </Button>
    </form>
  );
}
