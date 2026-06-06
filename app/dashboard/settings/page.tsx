import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";
import { SettingsForm } from "@/components/settings/settings-form";
import { HeaderPage } from "@/components/header-page";

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
        <HeaderPage title="Account Settings" description="Manage your profile, email, and password" />

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
