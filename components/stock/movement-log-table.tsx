"use client";

import { useMemo } from "react";

import Typography from "@mui/material/Typography";

import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@/components/data-table";
import type { MovementLogRow } from "@/features/stock/types";
import { formatDisplayDateTime } from "@/lib/util/format-date-time";

import { MovementStatusChip } from "./movement-status-chip";
import { MovementTypeChip } from "./movement-type-chip";

interface MovementLogTableProps {
  items: MovementLogRow[];
}

export function MovementLogTable({ items }: MovementLogTableProps) {
  const columns = useMemo<ColumnDef<MovementLogRow>[]>(
    () => [
      {
        id: "when",
        label: "Date / Time",
        render: (row) => (
          <Typography variant="body2">
            {formatDisplayDateTime(row.createdAt)}
          </Typography>
        ),
      },
      {
        id: "type",
        label: "Type",
        render: (row) => <MovementTypeChip type={row.movementType} />,
      },
      {
        id: "product",
        label: "Product",
        render: (row) => (
          <>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.productName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
            >
              {row.productSku}
            </Typography>
          </>
        ),
      },
      {
        id: "lot",
        label: "Lot",
        render: (row) => row.lotNo ?? "—",
      },
      {
        id: "quantity",
        label: "Quantity",
        align: "right",
        render: (row) => {
          const isReceive = row.movementType === "receive";
          return (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: isReceive ? "success.main" : "error.main",
              }}
            >
              {isReceive ? "+" : "−"}
              {row.quantity.toLocaleString()}
            </Typography>
          );
        },
      },
      {
        id: "balanceAfter",
        label: "Balance after",
        align: "right",
        render: (row) => row.balanceAfter?.toLocaleString() ?? "—",
      },
      {
        id: "status",
        label: "Status",
        render: (row) => <MovementStatusChip status={row.status} />,
      },
      {
        id: "user",
        label: "User",
        render: (row) => row.requestedByName ?? "—",
      },
    ],
    [],
  );

  return (
    <DataTable
      items={items}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage="ไม่พบรายการเคลื่อนไหว"
    />
  );
}
