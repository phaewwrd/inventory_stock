import type { Metadata } from "next";
import Link from "next/link";

import { UserStats } from "@/components/users/user-stats";
import { UserTable } from "@/components/users/user-table";
import { getUsersService } from "@/features/users/service";
import type { SerializedUser } from "@/features/users/types";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "User Management | StockMS",
  description:
    "จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ — create, edit, disable accounts and assign roles.",
};

// ─── Nav config ───────────────────────────────────────────────────────────────

type NavItem = { name: string; href: string; active?: boolean; badge?: number };
type NavSection = { label: string; items: NavItem[] };

const navSections: NavSection[] = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Products", href: "/dashboard/products" },
    ],
  },
  {
    label: "TRANSACTIONS",
    items: [
      { name: "Receive stock", href: "/dashboard/stock/receive" },
      { name: "Cut stock", href: "/dashboard/stock/cut" },
      { name: "Movement log", href: "/dashboard/stock/history" },
    ],
  },
  {
    label: "MONITOR",
    items: [
      { name: "Expiry", href: "/dashboard/expiry", badge: 25 },
      { name: "Reports", href: "/dashboard/reports" },
    ],
  },
  {
    label: "ADMIN",
    items: [
      { name: "Users", href: "/dashboard/users", active: true },
      { name: "Settings", href: "/dashboard/settings" },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UsersPage() {
  const rawUsers = await getUsersService();

  // Serialize Date → string for the client boundary
  const users: SerializedUser[] = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#1a1a1a", color: "#e5e5e5" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
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

              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm mb-0.5"
                  style={
                    item.active
                      ? {
                          background: "#1d4ed8",
                          color: "#fff",
                          fontWeight: 500,
                        }
                      : { color: "#777" }
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="shrink-0 rounded"
                      style={{
                        width: 15,
                        height: 15,
                        border: `1.5px solid ${item.active ? "#93c5fd" : "#3a3a3a"}`,
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
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-6 shrink-0"
          style={{
            height: 56,
            borderBottom: "1px solid #2e2e2e",
            background: "#1a1a1a",
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" style={{ color: "#555" }}>
              Dashboard
            </Link>
            <span style={{ color: "#333" }}>›</span>
            <span className="font-medium text-white">Users</span>
          </div>

          {/* Right slot */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Notification placeholder */}
            <button
              type="button"
              className="rounded-lg flex items-center justify-center"
              style={{
                width: 34,
                height: 34,
                background: "#2a2a2a",
                border: "1px solid #333",
              }}
              aria-label="Notifications"
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  border: "1.5px solid #555",
                  display: "inline-block",
                  borderRadius: 3,
                }}
              />
            </button>

            {/* User chip */}
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{ background: "#222222", border: "1px solid #2e2e2e" }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ background: "#1d4ed8" }}
              >
                A
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white leading-tight">
                  Admin
                </div>
                <div className="truncate text-xs" style={{ color: "#555" }}>
                  Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {/* Page heading */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                User Management
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#666" }}>
                จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ
              </p>
            </div>

            {/* Quick back link */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                border: "1.5px solid #2e2e2e",
                color: "#777",
                background: "transparent",
              }}
            >
              ← Dashboard
            </Link>
          </div>

          {/* Stats cards */}
          <UserStats users={users} />

          {/* Table card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#272727", border: "1px solid #2e2e2e" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-semibold text-white text-sm">
                  All Users
                </span>
                <span
                  className="ml-2 text-xs rounded-full px-2 py-0.5 font-medium"
                  style={{ background: "#1a1a1a", color: "#555" }}
                >
                  {users.length}
                </span>
              </div>
            </div>

            <UserTable initialUsers={users} />
          </div>
        </main>
      </div>
    </div>
  );
}
