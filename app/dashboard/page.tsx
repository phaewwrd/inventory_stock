"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";

const recentTransactions = [
  {
    name: "Amoxicillin 250mg",
    detail: "Lot #A2024-03 · Receive",
    qty: "+120 units",
    positive: true,
  },
  {
    name: "Cefixime 100mg/5ml",
    detail: "Lot #C2023-11 · Cut stock",
    qty: "-48 units",
    positive: false,
  },
  {
    name: "Paracetamol 500mg",
    detail: "Lot #P2024-01 · Receive",
    qty: "+200 units",
    positive: true,
  },
  {
    name: "Ibuprofen 400mg",
    detail: "Lot #I2023-09 · Cut stock",
    qty: "-30 units",
    positive: false,
  },
];

const expiryWatch = [
  {
    name: "Cefixime 100mg/5ml",
    lot: "Lot #C2023-11",
    expiry: "14 Jan 2024",
    status: "expired",
  },
  {
    name: "Amoxicillin 125mg",
    lot: "Lot #A2023-06",
    expiry: "28 Feb 2024",
    status: "expired",
  },
  {
    name: "Metronidazole 200mg",
    lot: "Lot #M2024-02",
    expiry: "15 Jun 2026",
    status: "near",
  },
  {
    name: "Omeprazole 20mg",
    lot: "Lot #O2024-04",
    expiry: "30 Jun 2026",
    status: "near",
  },
];



const statCards = [
  {
    bg: "#1d4ed8",
    value: "1,248",
    valueColor: "#ffffff",
    label: "Total products",
    sub: "+12 added this week",
  },
  {
    bg: "#b45309",
    value: "34",
    valueColor: "#f59e0b",
    label: "Low stock alerts",
    sub: "Below reorder level",
  },
  {
    bg: "#92400e",
    value: "18",
    valueColor: "#f59e0b",
    label: "Near expiry",
    sub: "Within 30 days",
  },
  {
    bg: "#7f1d1d",
    value: "7",
    valueColor: "#ef4444",
    label: "Expired products",
    sub: "Requires action",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signOutError, setSignOutError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName = session?.user.name || "Warehouse user";
  const userEmail = session?.user.email || "Signed in";
  const userInitial = userName.charAt(0).toUpperCase();

  async function handleSignOut() {
    setSignOutError("");
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result?.error) {
        setSignOutError(result.error.message || "Failed to sign out.");
        return;
      }
      router.replace(ROUTES.LOGIN);
      router.refresh();
    } catch (error: unknown) {
      setSignOutError(
        error instanceof Error ? error.message : "Failed to sign out.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

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
          <span className="font-medium text-white text-sm">Dashboard</span>
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search products, lots..."
              className="w-full rounded-lg px-4 py-1.5 text-sm outline-none"
              style={{
                background: "#2a2a2a",
                border: "1px solid #333",
                color: "#ccc",
              }}
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {[0, 1].map((i) => (
              <button
                key={i}
                className="rounded-lg flex items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  background: "#2a2a2a",
                  border: "1px solid #333",
                }}
              >
                <span
                  style={{
                    width: 13,
                    height: 13,
                    border: "1.5px solid #666",
                    display: "inline-block",
                    borderRadius: 3,
                  }}
                />
              </button>
            ))}
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

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {signOutError && (
            <div
              className="mb-4 rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(127, 29, 29, 0.35)",
                border: "1px solid #7f1d1d",
                color: "#fca5a5",
              }}
            >
              {signOutError}
            </div>
          )}

          {/* Page heading */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Overview</h1>
              <p className="text-sm mt-0.5" style={{ color: "#777" }}>
                {dateStr} · Warehouse A
              </p>
              {!isPending && (
                <p className="mt-1 text-xs" style={{ color: "#888" }}>
                  Signed in as {userName}
                </p>
              )}
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{
                border: "1.5px solid #3a3a3a",
                background: "transparent",
              }}
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  border: "1.5px solid #aaa",
                  display: "inline-block",
                  borderRadius: 2,
                }}
              />
              New transaction
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-5"
                style={{ background: "#272727", border: "1px solid #2e2e2e" }}
              >
                <div
                  className="rounded-xl flex items-center justify-center mb-4"
                  style={{ width: 42, height: 42, background: card.bg }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.55)",
                      display: "inline-block",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: card.valueColor }}
                >
                  {card.value}
                </div>
                <div className="text-sm text-white font-medium">
                  {card.label}
                </div>
                <div className="text-xs mt-1" style={{ color: "#666" }}>
                  {card.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom panels */}
          <div className="grid grid-cols-2 gap-4">
            {/* Recent transactions */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#272727", border: "1px solid #2e2e2e" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-white text-sm">
                  Recent transactions
                </span>
                <button className="text-xs" style={{ color: "#3b82f6" }}>
                  View all
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.name + tx.detail}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="rounded-full shrink-0"
                      style={{
                        width: 8,
                        height: 8,
                        background: tx.positive ? "#22c55e" : "#3b82f6",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {tx.name}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: "#777" }}
                      >
                        {tx.detail}
                      </div>
                    </div>
                    <div
                      className="text-sm font-medium shrink-0"
                      style={{ color: tx.positive ? "#22c55e" : "#f87171" }}
                    >
                      {tx.qty}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry watch */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#272727", border: "1px solid #2e2e2e" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-white text-sm">
                  Expiry watch
                </span>
                <button className="text-xs" style={{ color: "#3b82f6" }}>
                  View all
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {expiryWatch.map((item) => (
                  <div
                    key={item.name + item.lot}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {item.name}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ color: "#777" }}
                      >
                        {item.lot}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-xs font-semibold"
                        style={{
                          color:
                            item.status === "expired" ? "#ef4444" : "#f59e0b",
                        }}
                      >
                        {item.status === "expired" ? "Expired" : "Near expiry"}
                      </div>
                      <div className="text-xs" style={{ color: "#555" }}>
                        {item.expiry}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
    </>
  );
}
