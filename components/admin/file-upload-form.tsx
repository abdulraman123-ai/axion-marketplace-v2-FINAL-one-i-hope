"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadFormProps {
  products: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function FileUploadForm({ products, onSuccess }: FileUploadFormProps) {
  const [productId, setProductId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    if (!file) {
      setError("Please select a file.");
      setStatus("error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productId", productId);
      formData.append("version", version);
      formData.append("fileLabel", fileLabel);

      const response = await fetch("/api/admin/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to upload file.");
      }

      setStatus("done");
      setProductId("");
      setFile(null);
      setVersion("");
      setFileLabel("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-xl border border-border p-4">
      <p className="text-sm font-medium text-text-primary">Upload file</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">Version (optional)</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">File label (optional)</label>
          <input
            type="text"
            value={fileLabel}
            onChange={(e) => setFileLabel(e.target.value)}
            placeholder="Main file"
            className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
          />
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {status === "done" && <p className="text-sm text-success">File uploaded.</p>}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
