"use client";

import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Skeleton,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { HeaderPage } from "@/components/header-page";
import {
	BarChartComponent,
	ChartCard,
	LineChartComponent,
	PieChartComponent,
} from "@/components/reports/charts";
import type { Column } from "@/components/reports/data-table";
import { DataTable } from "@/components/reports/data-table";
import { DateRangeFilter } from "@/components/reports/date-range-filter";
import { KPIGrid } from "@/components/reports/kpi-card";
import {
	useExpiryReport,
	useProductReport,
	useStockIssuedReport,
	useStockReceivedReport,
} from "@/features/reports/hooks";
import {
	type ReportFilterState,
	useReportsStore,
} from "@/features/reports/store";
import type {
	DateRangePreset,
	ExpiryReportResponse,
	ProductReportResponse,
	SerializedExpiryReport,
	SerializedProductReport,
	SerializedStockIssuedReport,
	SerializedStockReceivedReport,
	StockIssuedReportResponse,
	StockReceivedReportResponse,
} from "@/features/reports/types";
import {
	exportExpiryReportToExcel,
	exportProductReportToExcel,
	exportStockIssuedReportToExcel,
	exportStockReceivedReportToExcel,
} from "@/lib/excel-export";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(value: Date | string, pattern: string) {
	return dayjs(value).format(pattern);
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function TabLoadingSkeleton() {
	return (
		<Stack spacing={3}>
			<Skeleton variant="rounded" height={120} />
			<Skeleton variant="rounded" height={80} />
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
					gap: 2,
				}}
			>
				<Skeleton variant="rounded" height={300} />
				<Skeleton variant="rounded" height={300} />
			</Box>
			<Skeleton variant="rounded" height={400} />
		</Stack>
	);
}

interface TabErrorProps {
	message: string;
	onRetry: () => void;
}

function TabError({ message, onRetry }: TabErrorProps) {
	return (
		<Alert
			severity="error"
			sx={{ mt: 1 }}
			action={
				<Button color="inherit" size="small" onClick={onRetry}>
					Retry
				</Button>
			}
		>
			{message}
		</Alert>
	);
}

function TabEmpty({ label }: { label: string }) {
	return (
		<Box sx={{ textAlign: "center", py: 8 }}>
			<Typography variant="h6" color="text.secondary">
				No data available
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
				No {label} records found for the selected date range.
			</Typography>
		</Box>
	);
}

// ─── TabContent wrapper ───────────────────────────────────────────────────────

interface TabContentProps {
	isLoading: boolean;
	isFetching: boolean;
	error: Error | null;
	onRetry: () => void;
	isEmpty: boolean;
	emptyLabel: string;
	children: React.ReactNode;
}

function TabContent({
	isLoading,
	isFetching,
	error,
	onRetry,
	isEmpty,
	emptyLabel,
	children,
}: TabContentProps) {
	if (isLoading) return <TabLoadingSkeleton />;
	if (error) return <TabError message={error.message} onRetry={onRetry} />;
	if (isEmpty) return <TabEmpty label={emptyLabel} />;

	return (
		<Box sx={{ position: "relative" }}>
			{/* Background fetch indicator — non-blocking */}
			{isFetching && (
				<Box
					sx={{
						position: "absolute",
						top: -8,
						right: 0,
						display: "flex",
						alignItems: "center",
						gap: 1,
						zIndex: 1,
					}}
				>
					<CircularProgress size={16} />
					<Typography variant="caption" color="text.secondary">
						Refreshing…
					</Typography>
				</Box>
			)}
			{children}
		</Box>
	);
}

// ─── Filter props shape shared across filter-aware tabs ───────────────────────

interface FilterTabProps {
	filter: ReportFilterState;
	onPresetChange: (preset: DateRangePreset) => void;
	onCustomDateChange: (start: Date | null, end: Date | null) => void;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
	// ── UI state (Zustand selectors) ─────────────────────────────────────────
	const activeTab = useReportsStore((state) => state.activeTab);
	const productFilter = useReportsStore((state) => state.productFilter);
	const expiryFilter = useReportsStore((state) => state.expiryFilter);
	const receivedFilter = useReportsStore((state) => state.receivedFilter);
	const issuedFilter = useReportsStore((state) => state.issuedFilter);

	// ── Actions (stable references — no useShallow needed) ───────────────────
	const setActiveTab = useReportsStore((s) => s.setActiveTab);
	const setProductPreset = useReportsStore((s) => s.setProductPreset);
	const setProductCustomDateRange = useReportsStore(
		(s) => s.setProductCustomDateRange,
	);
	const setReceivedPreset = useReportsStore((s) => s.setReceivedPreset);
	const setReceivedCustomDateRange = useReportsStore(
		(s) => s.setReceivedCustomDateRange,
	);
	const setIssuedPreset = useReportsStore((s) => s.setIssuedPreset);
	const setIssuedCustomDateRange = useReportsStore(
		(s) => s.setIssuedCustomDateRange,
	);

	// ── Data (TanStack Query — each tab owns its own query) ──────────────────
	const productQuery = useProductReport(productFilter);
	const expiryQuery = useExpiryReport(expiryFilter);
	const receivedQuery = useStockReceivedReport(receivedFilter);
	const issuedQuery = useStockIssuedReport(issuedFilter);
	console.log("product data", productQuery);
	console.log("expiry data", expiryQuery.data);
	console.log("received data", receivedQuery.data);
	console.log("issued data", issuedQuery.data);
	console.log("product error", productQuery.error);
	console.log("received error", receivedQuery.error);
	console.log("issued error", issuedQuery.error);

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<HeaderPage
				title="Reports & Analytics"
				description="Track products, expiry, stock received, and stock issued trends"
				showDashboardBtn={false}
			/>

			<Tabs
				value={activeTab}
				onChange={(_, value) => setActiveTab(value)}
				sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
			>
				<Tab label="Products" value="products" />
				<Tab label="Expiry" value="expiry" />
				<Tab label="Stock Received" value="received" />
				<Tab label="Stock Issued" value="issued" />
			</Tabs>

			{activeTab === "products" && (
				<TabContent
					isLoading={productQuery.isLoading}
					isFetching={productQuery.isFetching}
					error={productQuery.error}
					onRetry={() => void productQuery.refetch()}
					isEmpty={
						productQuery.data !== undefined &&
						productQuery.data.items.length === 0
					}
					emptyLabel="product"
				>
					{productQuery.data && (
						<ProductReportTab
							report={productQuery.data}
							filter={productFilter}
							onPresetChange={setProductPreset}
							onCustomDateChange={setProductCustomDateRange}
						/>
					)}
				</TabContent>
			)}

			{activeTab === "expiry" && (
				<TabContent
					isLoading={expiryQuery.isLoading}
					isFetching={expiryQuery.isFetching}
					error={expiryQuery.error}
					onRetry={() => void expiryQuery.refetch()}
					isEmpty={
						expiryQuery.data !== undefined &&
						expiryQuery.data.items.length === 0
					}
					emptyLabel="expiry"
				>
					{expiryQuery.data && <ExpiryReportTab report={expiryQuery.data} />}
				</TabContent>
			)}

			{activeTab === "received" && (
				<TabContent
					isLoading={receivedQuery.isLoading}
					isFetching={receivedQuery.isFetching}
					error={receivedQuery.error}
					onRetry={() => void receivedQuery.refetch()}
					isEmpty={
						receivedQuery.data !== undefined &&
						receivedQuery.data.items.length === 0
					}
					emptyLabel="stock received"
				>
					{receivedQuery.data && (
						<StockReceivedReportTab
							report={receivedQuery.data}
							filter={receivedFilter}
							onPresetChange={setReceivedPreset}
							onCustomDateChange={setReceivedCustomDateRange}
						/>
					)}
				</TabContent>
			)}

			{activeTab === "issued" && (
				<TabContent
					isLoading={issuedQuery.isLoading}
					isFetching={issuedQuery.isFetching}
					error={issuedQuery.error}
					onRetry={() => void issuedQuery.refetch()}
					isEmpty={
						issuedQuery.data !== undefined &&
						issuedQuery.data.items.length === 0
					}
					emptyLabel="stock issued"
				>
					{issuedQuery.data && (
						<StockIssuedReportTab
							report={issuedQuery.data}
							filter={issuedFilter}
							onPresetChange={setIssuedPreset}
							onCustomDateChange={setIssuedCustomDateRange}
						/>
					)}
				</TabContent>
			)}
		</main>
	);
}

// ─── Product Report Tab ───────────────────────────────────────────────────────

interface ProductReportTabProps extends FilterTabProps {
	report: ProductReportResponse;
}

function ProductReportTab({
	report,
	filter,
	onPresetChange,
	onCustomDateChange,
}: ProductReportTabProps) {
	const productColumns: Column<SerializedProductReport>[] = [
		{ id: "productName", label: "Product Name" },
		{ id: "sku", label: "SKU" },
		{ id: "category", label: "Category" },
		{
			id: "totalReceived",
			label: "Received",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{
			id: "totalIssued",
			label: "Issued",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{
			id: "currentStock",
			label: "Current Stock",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{
			id: "totalValue",
			label: "Value",
			align: "right",
			format: (val) =>
				`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
		},
	];

	const categoryChartData =
		report.summary.categoryBreakdown?.map((cat) => ({
			name: cat.category,
			value: cat.count,
		})) ?? [];

	const topProductsChartData = report.summary.topProducts.map((p) => ({
		productName: p.productName,
		quantity: p.quantity,
	}));

	return (
		<Stack spacing={3}>
			<DateRangeFilter
				preset={filter.preset}
				onPresetChange={onPresetChange}
				customStartDate={filter.customStart}
				customEndDate={filter.customEnd}
				onCustomDateChange={onCustomDateChange}
				onApply={() => {
					/* custom date range applied via query key; no extra action needed */
				}}
			/>

			<KPIGrid kpis={report.kpis} />

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
					gap: 2,
				}}
			>
				<ChartCard title="Products by Category">
					<PieChartComponent
						data={categoryChartData}
						colors={[
							"#185FA5",
							"#639922",
							"#BA7517",
							"#E24B4A",
							"#378ADD",
							"#8A919E",
						]}
						showLabel={false}
					/>
				</ChartCard>

				<ChartCard title="Top 10 Products by Stock Level">
					<BarChartComponent
						data={topProductsChartData}
						xKey="productName"
						bars={[{ key: "quantity", color: "#185FA5", name: "Quantity" }]}
						horizontal
					/>
				</ChartCard>
			</Box>

			<DataTable<SerializedProductReport>
				title="Product Details"
				columns={productColumns}
				data={report.items}
				onExport={() =>
					exportProductReportToExcel(report.items, report.dateRange)
				}
			/>
		</Stack>
	);
}

// ─── Expiry Report Tab ────────────────────────────────────────────────────────

function ExpiryReportTab({ report }: { report: ExpiryReportResponse }) {
	const expiryColumns: Column<SerializedExpiryReport>[] = [
		{ id: "lotNo", label: "Lot No" },
		{ id: "productName", label: "Product Name" },
		{ id: "sku", label: "SKU" },
		{
			id: "expiryDate",
			label: "Expiry Date",
			format: (val) => formatDate(String(val), "MMM DD, YYYY"),
		},
		{
			id: "daysUntilExpiry",
			label: "Days Until Expiry",
			align: "right",
		},
		{
			id: "status",
			label: "Status",
			format: (val) => String(val).toUpperCase(),
		},
		{
			id: "remainingQty",
			label: "Qty",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{
			id: "totalValue",
			label: "Value",
			align: "right",
			format: (val) =>
				`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
		},
	];

	const statusChartData = report.summary.statusBreakdown.map((s) => ({
		name: s.status,
		value: s.count,
	}));

	const statusValueChartData = report.summary.statusBreakdown.map((s) => ({
		status: s.status,
		value: s.value,
	}));

	return (
		<Stack spacing={3}>
			<KPIGrid kpis={report.kpis} />

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
					gap: 2,
				}}
			>
				<ChartCard title="Items by Expiry Status">
					<PieChartComponent
						data={statusChartData}
						colors={["#E24B4A", "#BA7517", "#FFC107", "#639922"]}
						showLabel={false}
					/>
				</ChartCard>

				<ChartCard title="Value by Expiry Status">
					<BarChartComponent
						data={statusValueChartData}
						xKey="status"
						bars={[{ key: "value", color: "#185FA5", name: "Value ($)" }]}
					/>
				</ChartCard>
			</Box>

			<DataTable<SerializedExpiryReport>
				title="Expiry Details"
				columns={expiryColumns}
				data={report.items}
				onExport={() => exportExpiryReportToExcel(report.items)}
			/>
		</Stack>
	);
}

// ─── Stock Received Report Tab ────────────────────────────────────────────────

interface StockReceivedReportTabProps extends FilterTabProps {
	report: StockReceivedReportResponse;
}

function StockReceivedReportTab({
	report,
	filter,
	onPresetChange,
	onCustomDateChange,
}: StockReceivedReportTabProps) {
	const receivedColumns: Column<SerializedStockReceivedReport>[] = [
		{
			id: "date",
			label: "Date",
			format: (val) => formatDate(String(val), "MMM DD, YYYY HH:mm"),
		},
		{ id: "productName", label: "Product" },
		{ id: "sku", label: "SKU" },
		{ id: "lotNo", label: "Lot No" },
		{
			id: "quantity",
			label: "Quantity",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{
			id: "unitCost",
			label: "Unit Cost",
			align: "right",
			format: (val) =>
				`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
		},
		{
			id: "totalCost",
			label: "Total Cost",
			align: "right",
			format: (val) =>
				`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
		},
		{ id: "createdByName", label: "Created By" },
	];

	const topProductsData =
		report.summary.topReceivedProducts?.map((p) => ({
			productName: p.productName,
			quantity: p.quantity,
		})) ?? [];

	return (
		<Stack spacing={3}>
			<DateRangeFilter
				preset={filter.preset}
				onPresetChange={onPresetChange}
				customStartDate={filter.customStart}
				customEndDate={filter.customEnd}
				onCustomDateChange={onCustomDateChange}
				onApply={() => {
					/* custom date range applied via query key; no extra action needed */
				}}
			/>

			<KPIGrid kpis={report.kpis} />

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
					gap: 2,
				}}
			>
				<ChartCard title="Stock Movement Timeline">
					<LineChartComponent
						data={report.summary.timeSeries ?? []}
						xKey="date"
						lines={[
							{ key: "received", color: "#639922", name: "Received" },
							{ key: "issued", color: "#E24B4A", name: "Issued" },
							{ key: "balance", color: "#185FA5", name: "Balance" },
						]}
					/>
				</ChartCard>

				<ChartCard title="Top 10 Received Products">
					<BarChartComponent
						data={topProductsData}
						xKey="productName"
						bars={[{ key: "quantity", color: "#639922", name: "Quantity" }]}
						horizontal
					/>
				</ChartCard>
			</Box>

			<DataTable<SerializedStockReceivedReport>
				title="Stock Received Transactions"
				columns={receivedColumns}
				data={report.items}
				onExport={() =>
					exportStockReceivedReportToExcel(report.items, report.dateRange)
				}
			/>
		</Stack>
	);
}

// ─── Stock Issued Report Tab ──────────────────────────────────────────────────

interface StockIssuedReportTabProps extends FilterTabProps {
	report: StockIssuedReportResponse;
}

function StockIssuedReportTab({
	report,
	filter,
	onPresetChange,
	onCustomDateChange,
}: StockIssuedReportTabProps) {
	const issuedColumns: Column<SerializedStockIssuedReport>[] = [
		{
			id: "date",
			label: "Date",
			format: (val) => formatDate(String(val), "MMM DD, YYYY HH:mm"),
		},
		{ id: "productName", label: "Product" },
		{ id: "sku", label: "SKU" },
		{ id: "lotNo", label: "Lot No" },
		{
			id: "quantity",
			label: "Quantity",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{
			id: "balanceAfter",
			label: "Balance After",
			align: "right",
			format: (val) => Number(val).toLocaleString(),
		},
		{ id: "remark", label: "Remark" },
		{ id: "createdByName", label: "Created By" },
	];

	const topProductsData =
		report.summary.topIssuedProducts?.map((p) => ({
			productName: p.productName,
			quantity: p.quantity,
		})) ?? [];

	return (
		<Stack spacing={3}>
			<DateRangeFilter
				preset={filter.preset}
				onPresetChange={onPresetChange}
				customStartDate={filter.customStart}
				customEndDate={filter.customEnd}
				onCustomDateChange={onCustomDateChange}
				onApply={() => {
					/* custom date range applied via query key; no extra action needed */
				}}
			/>

			<KPIGrid kpis={report.kpis} />

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
					gap: 2,
				}}
			>
				<ChartCard title="Stock Movement Timeline">
					<LineChartComponent
						data={report.summary.timeSeries ?? []}
						xKey="date"
						lines={[
							{ key: "received", color: "#639922", name: "Received" },
							{ key: "issued", color: "#E24B4A", name: "Issued" },
							{ key: "balance", color: "#185FA5", name: "Balance" },
						]}
					/>
				</ChartCard>

				<ChartCard title="Top 10 Issued Products">
					<BarChartComponent
						data={topProductsData}
						xKey="productName"
						bars={[{ key: "quantity", color: "#E24B4A", name: "Quantity" }]}
						horizontal
					/>
				</ChartCard>
			</Box>

			<DataTable<SerializedStockIssuedReport>
				title="Stock Issued Transactions"
				columns={issuedColumns}
				data={report.items}
				onExport={() =>
					exportStockIssuedReportToExcel(report.items, report.dateRange)
				}
			/>
		</Stack>
	);
}
