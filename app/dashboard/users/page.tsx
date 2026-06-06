import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/constants/routes";
import { UserStats } from "@/components/users/user-stats";
import { UserTable } from "@/components/users/user-table";
import { getUsersService } from "@/features/users/service";
import type { SerializedUser } from "@/features/users/types";
import { HeaderPage } from "@/components/header-page";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "User Management | StockMS",
  description:
    "จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ — create, edit, disable accounts and assign roles.",
};


// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UsersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "OWNER") {
    redirect(ROUTES.DASHBOARD.HOME);
  }

  const rawUsers = await getUsersService();

  // Serialize Date → string for the client boundary
  const users: SerializedUser[] = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return (
    <>


      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-8 py-7">
        <HeaderPage title="User Management" description="จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ" />
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
    </>
  );
}
