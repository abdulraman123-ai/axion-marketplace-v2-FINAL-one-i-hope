import { redirect } from "next/navigation";
import { ConsoleShell } from "@/components/admin/console-shell";
import { getCurrentUserRoles } from "@/lib/admin";

// Wraps admin pages in the console shell and enforces admin authorization
// server-side. The authoritative guard is app/admin/layout.tsx (requireAdmin),
// but this component double-checks so each page stays protected even if it's
// ever rendered outside the layout (e.g. in tests or a refactor).
export async function FounderConsolePage({
  children,
}: {
  children: React.ReactNode;
}) {
  const roles = await getCurrentUserRoles();

  if (!roles.includes("admin")) {
    redirect("/products");
  }

  return <ConsoleShell>{children}</ConsoleShell>;
}