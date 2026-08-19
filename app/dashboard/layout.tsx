import { requireAuth } from "@/lib/auth";
import { getCurrentUserRoles } from "@/lib/admin";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  if (!user) {
    redirect("/sign-in");
  }

  const roles = await getCurrentUserRoles();
  if (roles.includes("admin")) {
    redirect("/admin/dashboard");
  }

  return <DashboardShell userEmail={user.email}>{children}</DashboardShell>;
}