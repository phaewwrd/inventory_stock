"use client";

import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { ListItemIcon, ListItemText, Stack, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@/components/data-table";
import { DataTable } from "@/components/data-table";
import { useSnackbar } from "@/components/feedback/snackbar-provider";
import { ROUTES } from "@/constants/routes";
import { deleteProductAction } from "@/features/products/actions";
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
	canManage: boolean;
}

// ─── Cell renderers (kept outside the component so they're stable) ──────────

function RowActions({
	product,
	onView,
	onDelete,
	canManage,
}: {
	product: ProductListItem;
	onView: (id: string) => void;
	onDelete: (product: ProductListItem) => void;
	canManage: boolean;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const close = () => setAnchorEl(null);

	return (
		<Stack
			direction="row"
			spacing={0.5}
			sx={{ justifyContent: "flex-end" }}
			onClick={(e) => e.stopPropagation()}
		>
			<Tooltip title="Receive stock">
				<IconButton
					size="small"
					href={`${ROUTES.DASHBOARD.STOCK.RECEIVE}?productId=${product.id}`}
				>
					<DownloadOutlinedIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Tooltip title="Cut stock">
				<IconButton
					size="small"
					href={`${ROUTES.DASHBOARD.STOCK.CUT}?productId=${product.id}`}
				>
					<ContentCutOutlinedIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Tooltip title="More">
				<IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
					<MoreHorizIcon fontSize="small" />
				</IconButton>
			</Tooltip>

			<Menu anchorEl={anchorEl} open={anchorEl !== null} onClose={close}>
				<MenuItem
					onClick={() => {
						close();
						onView(product.id);
					}}
				>
					<ListItemIcon>
						<VisibilityOutlinedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>View detail</ListItemText>
				</MenuItem>
				{canManage && (
					<MenuItem
						component={Link}
						href={`${ROUTES.DASHBOARD.PRODUCTS}/${product.id}/edit`}
						onClick={close}
					>
						<ListItemIcon>
							<EditOutlinedIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Edit</ListItemText>
					</MenuItem>
				)}
				{canManage && (
					<MenuItem
						onClick={() => {
							close();
							onDelete(product);
						}}
						sx={{ color: "error.main" }}
					>
						<ListItemIcon>
							<DeleteOutlinedIcon fontSize="small" color="error" />
						</ListItemIcon>
						<ListItemText>Delete</ListItemText>
					</MenuItem>
				)}
			</Menu>
		</Stack>
	);
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function ProductsTable({
	items,
	sort,
	dir,
	canManage,
}: ProductsTableProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { show } = useSnackbar();
	const [openProductId, setOpenProductId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(
		null,
	);
	const [deleting, setDeleting] = useState(false);

	async function confirmDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			const result = await deleteProductAction(deleteTarget.id);
			if (result.success) {
				show("success", `ลบ ${deleteTarget.name} แล้ว`);
				router.refresh();
			} else {
				show("error", result.error);
			}
		} catch {
			show("error", "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
		} finally {
			setDeleteTarget(null);
			setDeleting(false);
		}
	}

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
					<RowActions
						product={row}
						onView={setOpenProductId}
						onDelete={setDeleteTarget}
						canManage={canManage}
					/>
				),
			},
		],
		[canManage],
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

			<Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
				<DialogTitle>ยืนยันการลบ</DialogTitle>
				<DialogContent>
					<DialogContentText>
						ลบสินค้า <strong>{deleteTarget?.name}</strong> ({deleteTarget?.sku})?
						หากสินค้ามีประวัติ stock จะลบไม่ได้ — ให้ปิดการใช้งานแทน
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
						ยกเลิก
					</Button>
					<Button color="error" onClick={confirmDelete} disabled={deleting}>
						{deleting ? "กำลังลบ…" : "ลบ"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
