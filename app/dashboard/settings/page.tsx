import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";
import { SettingsForm } from "@/components/settings/settings-form";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Settings | StockMS",
  description: "Manage your personal account settings.",
};


// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  const { user } = session;
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <>
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
            <Link href={ROUTES.DASHBOARD.HOME} style={{ color: "#555" }}>
              Dashboard
            </Link>
            <span style={{ color: "#333" }}>›</span>
            <span className="font-medium text-white">Settings</span>
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
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white leading-tight">
                  {user.name}
                </div>
                <div className="truncate text-xs" style={{ color: "#555" }}>
                  {(user as any).role || "User"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {/* Page heading */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Account Settings
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "#666" }}>
                Manage your profile, email, and password
              </p>
            </div>

            {/* Quick back link */}
            <Link
              href={ROUTES.DASHBOARD.HOME}
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

          <div className="max-w-5xl">
            <SettingsForm
              userName={user.name || ""}
              userEmail={user.email || ""}
              userInitial={userInitial}
              userRole={(user as any).role || "STOCK_USER"}
            />
          </div>
        </main>
    </>
  );
}
