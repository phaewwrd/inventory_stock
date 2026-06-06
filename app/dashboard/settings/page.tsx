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
            userRole={user.role || "STOCK_USER"}
          />
        </div>
      </main>
    </>
  );
}
