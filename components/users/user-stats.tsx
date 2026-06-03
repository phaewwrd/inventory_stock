import type { SerializedUser } from "@/features/users/types";

interface UserStatsProps {
  users: SerializedUser[];
}

type StatCard = {
  label: string;
  value: number;
  bg: string;
  valueColor: string;
  sub: string;
};

export function UserStats({ users }: UserStatsProps) {
  const total = users.length;
  const active = users.filter((u) => !u.disabled).length;
  const disabled = users.filter((u) => u.disabled).length;
  const owners = users.filter((u) => u.role === "OWNER").length;
  const managers = users.filter((u) => u.role === "STOCK_MANAGER").length;

  const cards: StatCard[] = [
    {
      label: "Total Users",
      value: total,
      bg: "#1d4ed8",
      valueColor: "#ffffff",
      sub: "All accounts",
    },
    {
      label: "Active",
      value: active,
      bg: "#166534",
      valueColor: "#4ade80",
      sub: "Can sign in",
    },
    {
      label: "Disabled",
      value: disabled,
      bg: "#7f1d1d",
      valueColor: "#ef4444",
      sub: "Access revoked",
    },
    {
      label: "Managers",
      value: managers,
      bg: "#5b21b6",
      valueColor: "#c4b5fd",
      sub: `${owners} owner${owners !== 1 ? "s" : ""}`,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      {cards.map((card) => (
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
          <div className="text-sm text-white font-medium">{card.label}</div>
          <div className="text-xs mt-1" style={{ color: "#666" }}>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
