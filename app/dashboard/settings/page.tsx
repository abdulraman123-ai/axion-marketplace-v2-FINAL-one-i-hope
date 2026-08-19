import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "./change-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Axion Marketplace",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const user = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          Settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Manage security and account preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface/70 p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          Change password
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Signed in as {user.email}. Update your password below.
        </p>
        <div className="mt-5">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}