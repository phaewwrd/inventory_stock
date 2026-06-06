"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";

type NavItem = { name: string; href: string; badge?: number };
type NavSection = { label: string; items: NavItem[] };

function getNavSections(role: string | undefined): NavSection[] {
  return [
    {
      label: "MAIN",
      items: [
        { name: "Dashboard", href: ROUTES.DASHBOARD.HOME },
        { name: "Products", href: ROUTES.DASHBOARD.PRODUCTS },
      ],
    },
    {
      label: "TRANSACTIONS",
      items: [
        { name: "Receive stock", href: ROUTES.DASHBOARD.STOCK.RECEIVE },
        { name: "Cut stock", href: ROUTES.DASHBOARD.STOCK.CUT },
        { name: "Movement log", href: ROUTES.DASHBOARD.STOCK.HISTORY },
      ],
    },
    {
      label: "MONITOR",
      items: [
        { name: "Expiry", href: ROUTES.DASHBOARD.EXPIRY, badge: 25 },
        { name: "Reports", href: ROUTES.DASHBOARD.REPORTS },
      ],
    },
    ...(role === "OWNER"
      ? [
        {
          label: "USERS MANAGEMENT",
          items: [{ name: "Users", href: ROUTES.DASHBOARD.USERS }],
        },
      ]
      : []),
    {
      label: "SETTINGS",
      items: [{ name: "Settings", href: ROUTES.DASHBOARD.SETTINGS }],
    },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;

  const navSections = getNavSections(role);

  function isActive(href: string) {
    if (href === ROUTES.DASHBOARD.HOME) return pathname === href;
    return pathname?.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 260,
        background: "#222222",
        borderRight: "1px solid #2e2e2e",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex items-center justify-center rounded-xl text-white font-bold text-lg shrink-0"
          style={{ width: 40, height: 40, background: "#2563eb" }}
        >
          S
        </div>
        <div>
          <div className="font-semibold text-white text-base leading-tight">
            StockMS
          </div>
          <div className="text-xs" style={{ color: "#888" }}>
            Phase 1
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-6">
        {navSections.map((section) => (
          <div key={section.label} className="mt-5">
            <div
              className="px-2 mb-1 text-xs font-semibold tracking-widest"
              style={{ color: "#555" }}
            >
              {section.label}
            </div>

            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm mb-0.5"
                  style={
                    active
                      ? { background: "#1d4ed8", color: "#fff", fontWeight: 500 }
                      : { color: "#777" }
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="shrink-0 rounded"
                      style={{
                        width: 15,
                        height: 15,
                        border: `1.5px solid ${active ? "#93c5fd" : "#3a3a3a"}`,
                        display: "inline-block",
                      }}
                    />
                    {item.name}
                  </div>

                  {item.badge != null && (
                    <span
                      className="text-xs font-bold rounded-full px-2 py-0.5"
                      style={{ background: "#b45309", color: "#fff" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}