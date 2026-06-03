import type { UserRole } from "@/features/users/types";

interface RoleBadgeProps {
  role: UserRole;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; bg: string; color: string; border: string }
> = {
  OWNER: {
    label: "Owner",
    bg: "rgba(29,78,216,0.25)",
    color: "#93c5fd",
    border: "#1d4ed8",
  },
  STOCK_MANAGER: {
    label: "Stock Manager",
    bg: "rgba(124,58,237,0.25)",
    color: "#c4b5fd",
    border: "#7c3aed",
  },
  STOCK_USER: {
    label: "Stock User",
    bg: "rgba(55,65,81,0.5)",
    color: "#9ca3af",
    border: "#374151",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  );
}
