"use client";

import Chip from "@mui/material/Chip";

import type { ProductStatus } from "@/features/products/types";

interface ProductStatusChipProps {
  status: ProductStatus;
}

interface StatusStyle {
  label: string;
  color: "success" | "warning" | "error" | "default";
  variant: "filled" | "outlined";
}

const STATUS_STYLES: Record<ProductStatus, StatusStyle> = {
  active: { label: "Active", color: "success", variant: "outlined" },
  low_stock: { label: "Low stock", color: "warning", variant: "outlined" },
  near_expiry: { label: "Near expiry", color: "warning", variant: "filled" },
  expired: { label: "Expired", color: "error", variant: "filled" },
  out_of_stock: { label: "Out of stock", color: "default", variant: "filled" },
};

export function ProductStatusChip({ status }: ProductStatusChipProps) {
  const style = STATUS_STYLES[status];
  return (
    <Chip
      label={style.label}
      color={style.color}
      variant={style.variant}
      size="small"
    />
  );
}
