"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Download,
  LayoutDashboard,
  Package,
  Settings2,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/purchases", label: "Purchases", icon: Package },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 },
];

export function DashboardShell({
  userEmail,
  children,
}: {
  userEmail: string | null | undefined;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-[80vh] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),transparent_32%),#09090b] text-text-primary">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-60">
          <div className="rounded-2xl border border-border/70 bg-surface/70 p-4">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <UserCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">My Account</p>
                <p className="truncate text-xs text-text-secondary">
                  {userEmail ?? "Signed in"}
                </p>
              </div>
            </div>
            <nav className="mt-4 space-y-1" aria-label="Account navigation">
              {nav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                      isActive
                        ? "bg-accent/15 text-text-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 border-t border-border/70 pt-4">
              <SignOutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}