"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Umum",
    items: [{ href: "/admin/dashboard", label: "Dashboard" }],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin/templates", label: "Templates" },
      { href: "/admin/themes", label: "Themes" },
    ],
  },
  {
    label: "Bisnis",
    items: [
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/invitations", label: "Invitations" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/subscriptions", label: "Subscriptions" },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/admin/ai", label: "AI Generator" },
      { href: "/admin/analytics", label: "Analytics" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-56 shrink-0 flex-col gap-6 border-r border-zinc-200 bg-white px-4 py-6">
      <Link href="/admin/dashboard" className="px-2 text-sm font-semibold text-zinc-900">
        undangan-digital.link
      </Link>

      {MENU_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
            {group.label}
          </p>
          <div className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
