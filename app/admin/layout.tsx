import { requireAdmin } from "@/lib/admin";

// Every page under /admin is protected by this server-side guard.
// Unauthenticated users → /sign-in. Non-admin users → /products.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}