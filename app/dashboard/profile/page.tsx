import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Axion Marketplace",
  description: "Manage your Axion Marketplace profile.",
};

export default async function ProfilePage() {
  const user = await requireAuth();
  const supabase = await createClient();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">
          Profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Update your public profile information.
        </p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface/70 p-6">
        <ProfileForm
          userId={user.id}
          email={user.email ?? ""}
          initialFullName={profile?.full_name ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? ""}
        />
      </div>
    </div>
  );
}