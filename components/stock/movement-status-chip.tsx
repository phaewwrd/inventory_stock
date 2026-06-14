import Chip from "@mui/material/Chip";

import type { MovementStatus } from "@/features/stock/types";

const STATUS_STYLES: Record<
  MovementStatus,
  { label: string; color: "warning" | "success" | "error" }
> = {
  pending: { label: "Pending", color: "warning" },
  approved: { label: "Approved", color: "success" },
  unapproved: { label: "Rejected", color: "error" },
};

export function MovementStatusChip({ status }: { status: MovementStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <Chip
      label={style.label}
      color={style.color}
      size="small"
      variant="outlined"
    />
  );
}
