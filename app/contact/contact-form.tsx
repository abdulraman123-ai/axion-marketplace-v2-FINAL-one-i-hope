"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send message.");
      }

      setStatus("done");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10 w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text-primary"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Message</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      {status === "done" && (
        <p className="text-sm text-success">Message sent. We&apos;ll get back to you soon.</p>
      )}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
