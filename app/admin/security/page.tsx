import { requireAdmin } from "@/lib/admin";
import { FounderConsolePage } from "@/components/admin/founder-console-page";
import { ConsoleCard } from "@/components/admin/console-card";
import { AdminSecuritySection } from "@/components/admin/admin-mfa-section";

export default async function AdminSecurityPage() {
  await requireAdmin();

  return (
    <FounderConsolePage>
      <div className="space-y-6">
        <ConsoleCard title="Password" eyebrow="Authentication">
          <p className="text-sm leading-7 text-text-secondary">
            Change your password from your account settings.
          </p>
        </ConsoleCard>

        <ConsoleCard title="Multi-factor authentication" eyebrow="Security">
          <AdminSecuritySection />
        </ConsoleCard>
      </div>
    </FounderConsolePage>
  );
}
