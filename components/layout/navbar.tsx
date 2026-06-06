"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const userName = session?.user?.name || "Warehouse user";
  const userEmail = session?.user?.email || "Signed in";
  const userInitial = userName.charAt(0).toUpperCase();

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.replace(ROUTES.LOGIN);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningOut(false);
    }
  }

  // Generate breadcrumb or title
  const segments = pathname.split("/").filter(Boolean);
  const pageName = segments[segments.length - 1] || "Dashboard";
  // Convert "users" to "Users", "receive-stock" to "Receive stock" etc.
  const formattedPageName = pageName
    .split("-")
    .map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");

  return (
    <header
      className="flex items-center gap-4 px-6 shrink-0"
      style={{
        height: 56,
        borderBottom: "1px solid #2e2e2e",
        background: "#1a1a1a",
      }}
    >
      {/* Left side: Navigation context */}

      <div className="flex items-center gap-2 text-sm flex-1">
        <Link href={ROUTES.DASHBOARD.HOME} style={{ color: "#555" }}>
          Inventory Management System
        </Link>
        <span style={{ color: "#333" }}>›</span>
        <span className="font-medium text-white">{formattedPageName}</span>
      </div>


      {/* Right side: Actions & User */}
      <div className="flex items-center gap-3 ml-auto">

        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2"
          style={{ background: "#222222", border: "1px solid #333" }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: "#1d4ed8" }}
          >
            {isPending ? "..." : userInitial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {isPending ? "Loading session..." : userName}
            </div>
            <div className="truncate text-xs" style={{ color: "#888" }}>
              {isPending ? "Fetching account" : userEmail}
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending || isSigningOut}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "#374151" }}
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
