"use client";

import { authClient } from "@/lib/auth-client";
import { Box, Card, Typography, Button } from "@mui/material";

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

const panelSx = {
  p: 3,
  borderRadius: 4,
  bgcolor: "#fff",
  border: "1px solid #e5e7eb",
  boxShadow: "none",
};

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const userName = session?.user.name || "Warehouse user";

  return (
    <div className="flex flex-col gap-4 m-10">
      {/* Page heading */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {statCards.map((card) => (
          <Card key={card.label} sx={panelSx}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(0,0,0,.15)",
                  borderRadius: 1,
                }}
              />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: card.valueColor,
                mb: 0.5,
              }}
            >
              {card.value}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              {card.label}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "#6b7280",
              }}
            >
              {card.sub}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Bottom panels */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        {/* Recent transactions */}
        <Card sx={panelSx}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Recent transactions
            </Typography>

            <Button size="small">View all</Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {recentTransactions.map((tx) => (
              <Box
                key={tx.name + tx.detail}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: tx.positive ? "#22c55e" : "#3b82f6",
                    flexShrink: 0,
                  }}
                />

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "#111827",
                    }}
                    noWrap
                  >
                    {tx.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                    }}
                    noWrap
                  >
                    {tx.detail}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: tx.positive ? "#16a34a" : "#dc2626",
                  }}
                >
                  {tx.qty}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Expiry watch */}
        <Card sx={panelSx}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Expiry watch
            </Typography>

            <Button size="small">View all</Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {expiryWatch.map((item) => (
              <Box
                key={item.name + item.lot}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "#111827",
                    }}
                    noWrap
                  >
                    {item.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "#6b7280",
                    }}
                    noWrap
                  >
                    {item.lot}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: "right",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: item.status === "expired" ? "#dc2626" : "#d97706",
                    }}
                  >
                    {item.status === "expired" ? "Expired" : "Near expiry"}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "#6b7280",
                    }}
                  >
                    {item.expiry}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </div>
  );
}
