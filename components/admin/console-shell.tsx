"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Download,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Package2,
  ReceiptText,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package2 },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/downloads", label: "Downloads", icon: Download },
  { href: "/admin/files", label: "Files", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: Users },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/security", label: "Security", icon: Shield },
];

const moduleMeta: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: "Dashboard",
    description: "A premium operating view for the AXION business, built for clarity and speed.",
  },
  products: {
    title: "Products",
    description: "Manage your catalog, visibility, pricing, and product detail flow.",
  },
  categories: {
    title: "Categories",
    description: "Organize products into categories for the storefront.",
  },
  orders: {
    title: "Orders",
    description: "Review purchase activity and maintain a clear handle on the business pipeline.",
  },
  customers: {
    title: "Customers",
    description: "Understand account health, purchases, and access without exposing anything sensitive.",
  },
  downloads: {
    title: "Downloads",
    description: "Track the delivery side of the product experience and support access.",
  },
  files: {
    title: "Files",
    description: "Manage product files stored in Supabase Storage.",
  },
  users: {
    title: "Users",
    description: "View and manage user accounts.",
  },
  roles: {
    title: "Roles",
    description: "Manage user roles and permissions.",
  },
  "audit-logs": {
    title: "Audit Logs",
    description: "Review admin actions and system events.",
  },
  analytics: {
    title: "Analytics",
    description: "Inspect growth signals, product performance, and customer momentum.",
  },
  security: {
    title: "Security",
    description: "Manage password and multi-factor authentication for your admin account.",
  },
};

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) ?? [];
  const activeSlug = segments[1] ?? "dashboard";
  const activeModule = moduleMeta[activeSlug] ?? moduleMeta.dashboard;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_32%),#09090b] text-text-primary">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <aside className="w-full shrink-0 rounded-[1.5rem] border border-border/70 bg-surface/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur lg:sticky lg:top-4 lg:w-72 lg:p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">AXION</p>
              <p className="text-xs text-text-secondary">Founder Console</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1" aria-label="Founder console navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-accent/15 text-text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
                      : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-70" aria-hidden="true" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-text-secondary">
              Internal access
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              This workspace is reserved for founders and authorized staff.
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="rounded-[1.5rem] border border-border/70 bg-surface/70 px-4 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.2)] backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
                  Founder Console
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-text-primary sm:text-4xl">
                  {activeModule.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                  {activeModule.description}
                </p>
              </div>
              <div className="rounded-full border border-border/70 bg-background/70 px-3 py-2 text-sm text-text-secondary">
                Secure internal workspace
              </div>
            </div>
          </header>

          <div className="mt-6 space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
