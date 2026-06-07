"use client";

import { useMemo, useState } from "react";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RemoveIcon from "@mui/icons-material/Remove";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import IconButton from "@mui/material/IconButton";
import { Stack, Tooltip, Typography } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/data-table";
import type { ColumnDef } from "@/components/data-table";
import { ROUTES } from "@/constants/routes";
import type {
  ProductListItem,
  ProductSortField,
  SortDirection,
} from "@/features/products/types";
import { formatDisplayDate } from "@/lib/util/format-date-time";

import { ProductDetailModal } from "./product-detail-modal";
import { ProductStatusChip } from "./product-status-chip";

interface ProductsTableProps {
  items: Array<ProductListItem>;
  sort: ProductSortField;
  dir: SortDirection;
}

// ─── Cell renderers (kept outside the component so they're stable) ──────────

function RowActions({
  productId,
  onView,
}: {
  productId: string;
  onView: (id: string) => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ justifyContent: "flex-end" }}
      onClick={(e) => e.stopPropagation()}
    >
      <Tooltip title="Receive stock">
        <IconButton size="small" href={ROUTES.DASHBOARD.STOCK.RECEIVE}>
          <VerticalAlignBottomIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Cut stock">
        <IconButton size="small" href={ROUTES.DASHBOARD.STOCK.CUT}>
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="View detail">
        <IconButton size="small" onClick={() => onView(productId)}>
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function ProductsTable({ items, sort, dir }: ProductsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  function handleSortChange(field: ProductSortField) {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir: SortDirection =
      sort === field && dir === "asc" ? "desc" : "asc";
    params.set("sort", field);
    params.set("dir", nextDir);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const columns = useMemo<Array<ColumnDef<ProductListItem, ProductSortField>>>(
    () => [
      {
        id: "code",
        label: "Code",
        sortField: "code",
        render: (row) => (
          <span style={{ fontFamily: "monospace" }}>{row.sku}</span>
        ),
      },
      {
        id: "name",
        label: "Product name",
        sortField: "name",
        render: (row) => (
          <>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.name}
            </Typography>
            {row.size && (
              <Typography variant="caption" color="text.secondary">
                {row.size}
              </Typography>
            )}
          </>
        ),
      },
      {
        id: "balance",
        label: "Balance",
        sortField: "balance",
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.totalBalance.toLocaleString()}
          </Typography>
        ),
      },
      {
        id: "unit",
        label: "Unit",
        render: (row) => row.unit,
      },
      {
        id: "lot",
        label: "Lot / Batch",
        render: (row) => row.representativeLot?.lotNo ?? "—",
      },
      {
        id: "expire",
        label: "Expire date",
        sortField: "expire",
        render: (row) =>
          formatDisplayDate(row.representativeLot?.expiryDate ?? null),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => <ProductStatusChip status={row.status} />,
      },
      {
        id: "actions",
        label: "Actions",
        align: "center",
        render: (row) => (
          <RowActions productId={row.id} onView={setOpenProductId} />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        items={items}
        columns={columns}
        getRowId={(row) => row.id}
        sort={sort}
        dir={dir}
        onSortChange={handleSortChange}
        onRowClick={(row) => setOpenProductId(row.id)}
        emptyMessage="No products found. Try adjusting your search or filters."
      />

      <ProductDetailModal
        productId={openProductId}
        open={openProductId !== null}
        onClose={() => setOpenProductId(null)}
      />
    </>
  );
}
