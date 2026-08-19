"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryFormProps {
  initialData?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
  };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function generateSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!initialData?.id) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      const response = await fetch(
        initialData?.id ? `/api/admin/categories/${initialData.id}` : "/api/admin/categories",
        {
          method: initialData?.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim() || null,
            imageUrl: imageUrl.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Failed to save category.");
      }

      setStatus("done");
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Name</label>
        <Input
          required
          placeholder="Category name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Slug</label>
        <Input
          required
          placeholder="category-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <p className="mt-1 text-xs text-text-secondary">Used in URLs. Lowercase, hyphens only.</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Description</label>
        <textarea
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Image URL</label>
        <Input
          placeholder="https://..."
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {status === "done" && <p className="text-sm text-success">Category saved.</p>}

      <Button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : initialData?.id ? "Update category" : "Create category"}
      </Button>
    </form>
  );
}
