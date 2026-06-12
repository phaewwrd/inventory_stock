"use client";

import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import {
	Alert,
	Box,
	Button,
	Chip,
	FormControl,
	InputAdornment,
	MenuItem,
	Paper,
	Select,
	Skeleton,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { HeaderPage } from "@/components/header-page";
import { type Column, DataTable } from "@/components/reports/data-table";
import { ExpiryProductDetailModal } from "@/components/reports/expiry-product-detail-modal";
import { KPIGrid } from "@/components/reports/kpi-card";
import { useExpiryReport } from "@/features/reports/hooks";
import type { SerializedExpiryReport } from "@/features/reports/types";
import { exportExpiryReportToExcel } from "@/lib/excel-export";

const defaultExpiryFilter = {
	preset: "last30days" as const,
	customStart: null,
	customEnd: null,
};

const STATUS_FILTERS = [
	{ value: "all", label: "All lots", color: "default" as const },
	{ value: "expired", label: "Expired", color: "error" as const },
	{ value: "critical", label: "Critical", color: "warning" as const },
	{ value: "warning", label: "Warning", color: "info" as const },
	{ value: "normal", label: "Normal", color: "success" as const },
] as const;

const statusPriority: Record<(typeof STATUS_FILTERS)[number]["value"], number> =
	{
		all: 0,
		expired: 0,
		critical: 1,
		warning: 2,
		normal: 3,
	};

const expiryColumns: Column<SerializedExpiryReport>[] = [
	{ id: "lotNo", label: "Lot No" },
	{ id: "productName", label: "Product Name" },
	{ id: "sku", label: "SKU" },
	{ id: "category", label: "Category" },
	{
		id: "expiryDate",
		label: "Expiry Date",
		format: (value) =>
			new Date(String(value)).toLocaleDateString("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
			}),
	},
	{
		id: "daysUntilExpiry",
		label: "Days Left",
		align: "right",
		format: (value) => Number(value).toLocaleString(),
	},
	{
		id: "status",
		label: "Status",
		format: (value) => String(value).replace(/_/g, " ").toUpperCase(),
	},
	{
		id: "remainingQty",
		label: "Qty",
		align: "right",
		format: (value) => Number(value).toLocaleString(),
	},
	{
		id: "totalValue",
		label: "Value",
		align: "right",
		format: (value) =>
			`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
	},
];

function getStatusCount(
	items: SerializedExpiryReport[],
	status: (typeof STATUS_FILTERS)[number]["value"],
) {
	return items.filter((item) => item.status === status).length;
}

export default function ExpiryPage() {
	const expiryQuery = useExpiryReport(defaultExpiryFilter);

	const [search, setSearch] = useState("");
	const [status, setStatus] =
		useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
	const [category, setCategory] = useState("all");
	const [openProductId, setOpenProductId] = useState<string | null>(null);
	const EMPTY_ITEMS: SerializedExpiryReport[] = [];
	const items = expiryQuery.data?.items ?? EMPTY_ITEMS;

	const categories = useMemo(() => {
		return Array.from(new Set(items.map((item) => item.category))).sort(
			(a, b) => a.localeCompare(b),
		);
	}, [items]);

	const filteredItems = useMemo(() => {
		const query = search.trim().toLowerCase();

		const nextItems = items.filter((item) => {
			const matchesStatus = status === "all" || item.status === status;
			const matchesCategory = category === "all" || item.category === category;

			const matchesSearch =
				query.length === 0 ||
				[item.productName, item.sku, item.lotNo, item.category].some((value) =>
					value.toLowerCase().includes(query),
				);

			return matchesStatus && matchesCategory && matchesSearch;
		});

		return nextItems.sort((a, b) => {
			const statusDiff = statusPriority[a.status] - statusPriority[b.status];
			if (statusDiff !== 0) {
				return statusDiff;
			}

			const expiryDiff = a.daysUntilExpiry - b.daysUntilExpiry;
			if (expiryDiff !== 0) {
				return expiryDiff;
			}

			return a.productName.localeCompare(b.productName);
		});
	}, [category, items, search, status]);

	const activeFilterCount = [
		search.trim(),
		status !== "all" ? status : "",
		category !== "all" ? category : "",
	].filter(Boolean).length;

	const statusCounts = useMemo(
		() =>
			Object.fromEntries(
				STATUS_FILTERS.map((filter) => [
					filter.value,
					filter.value === "all"
						? items.length
						: getStatusCount(items, filter.value),
				]),
			) as Record<(typeof STATUS_FILTERS)[number]["value"], number>,
		[items],
	);

	const isLoading = expiryQuery.isLoading;
	const error = expiryQuery.error;

	const exportButton = (
		<Button
			variant="outlined"
			size="small"
			startIcon={<DownloadIcon />}
			disabled={filteredItems.length === 0}
			onClick={() => void exportExpiryReportToExcel(filteredItems)}
		>
			Export list
		</Button>
	);

	if (isLoading) {
		return (
			<main className="flex-1 overflow-y-auto px-8 py-7">
				<Stack spacing={3}>
					<Skeleton variant="rounded" height={72} />
					<Skeleton variant="rounded" height={120} />
					<Skeleton variant="rounded" height={72} />
					<Skeleton variant="rounded" height={420} />
				</Stack>
			</main>
		);
	}

	if (error) {
		return (
			<main className="flex-1 overflow-y-auto px-8 py-7">
				<Stack spacing={3}>
					<HeaderPage
						title="Expiry"
						description="Search and review lots that are nearing or past expiry."
						showDashboardBtn={false}
						custombtn={exportButton}
					/>

					<Alert
						severity="error"
						action={
							<Button
								color="inherit"
								size="small"
								onClick={() => void expiryQuery.refetch()}
							>
								Retry
							</Button>
						}
					>
						{error.message}
					</Alert>
				</Stack>
			</main>
		);
	}

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<Stack spacing={3}>
				<HeaderPage
					title="Expiry report"
					description="Search and review lots that are nearing or past expiry."
					showDashboardBtn={false}
					custombtn={exportButton}
				/>

				<KPIGrid kpis={expiryQuery.data?.kpis ?? []} />

				<Paper
					variant="outlined"
					sx={{
						p: 2,
						borderRadius: 3,
						bgcolor: "background.paper",
					}}
				>
					<Stack spacing={2}>
						<Stack
							direction={{ xs: "column", md: "row" }}
							spacing={1.5}
							sx={{ alignItems: { xs: "stretch", md: "center" } }}
						>
							<TextField
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search by product, SKU, lot, or category"
								size="small"
								fullWidth
								sx={{ maxWidth: 420 }}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<SearchIcon fontSize="small" />
											</InputAdornment>
										),
									},
								}}
							/>

							<FormControl size="small" sx={{ minWidth: 220 }}>
								<Select
									value={category}
									onChange={(event) => setCategory(String(event.target.value))}
									displayEmpty
								>
									<MenuItem value="all">All categories</MenuItem>
									{categories.map((itemCategory) => (
										<MenuItem key={itemCategory} value={itemCategory}>
											{itemCategory}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							{activeFilterCount > 0 && (
								<Button
									variant="text"
									color="inherit"
									onClick={() => {
										setSearch("");
										setStatus("all");
										setCategory("all");
									}}
								>
									Clear filters
								</Button>
							)}
						</Stack>

						<Stack direction="row" spacing={1} useFlexGap>
							{STATUS_FILTERS.map((filter) => {
								const active = status === filter.value;
								return (
									<Chip
										key={filter.value}
										label={`${filter.label} (${statusCounts[filter.value]})`}
										clickable
										color={active ? filter.color : "default"}
										variant={active ? "filled" : "outlined"}
										onClick={() => setStatus(filter.value)}
									/>
								);
							})}
						</Stack>

						<Box
							sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
						>
							<Typography variant="body2" color="text.secondary">
								Showing {filteredItems.length.toLocaleString()} of{" "}
								{items.length.toLocaleString()} lots
							</Typography>
							{/* <Typography variant="body2" color="text.secondary">
								{activeFilterCount > 0
									? "Filters update the list instantly."
									: "Use search, category, and status filters to narrow the list."}
							</Typography> */}
						</Box>
					</Stack>
				</Paper>

				<DataTable<SerializedExpiryReport>
					key={`${search}|${status}|${category}|${filteredItems.length}`}
					title="Expiry list"
					columns={expiryColumns}
					data={filteredItems}
					onRowClick={(row) => setOpenProductId(String(row.productId))}
					onExport={() => void exportExpiryReportToExcel(filteredItems)}
					exportLabel="Export filtered"
				/>

				<ExpiryProductDetailModal
					productId={openProductId}
					open={openProductId !== null}
					onClose={() => setOpenProductId(null)}
				/>
			</Stack>
		</main>
	);
}
