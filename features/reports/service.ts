import "server-only";

import dayjs from "dayjs";
import {
	getCategoryBreakdown,
	getExpiryReportData,
	getProductReportData,
	getStockIssuedReportData,
	getStockReceivedReportData,
	getTimeSeriesData,
	getTopProducts,
} from "./repository";
import type {
	DateRange,
	DateRangePreset,
	ExpiryReportResponse,
	ExpirySummary,
	KPIData,
	ProductReportResponse,
	ProductSummary,
	SerializedExpiryReport,
	SerializedProductReport,
	SerializedStockIssuedReport,
	SerializedStockReceivedReport,
	StockIssuedReportResponse,
	StockMovementSummary,
	StockReceivedReportResponse,
} from "./types";

// ─── Date Range Helpers ──────────────────────────────────────────────────────

export async function getDateRangeFromPreset(
	preset: DateRangePreset,
): Promise<DateRange> {
	const today = dayjs();
	let startDate: Date;
	let endDate: Date;

	switch (preset) {
		case "today":
			startDate = today.startOf("day").toDate();
			endDate = today.endOf("day").toDate();
			break;
		case "yesterday":
			startDate = today.subtract(1, "day").startOf("day").toDate();
			endDate = today.subtract(1, "day").endOf("day").toDate();
			break;
		case "last7days":
			startDate = today.subtract(6, "day").startOf("day").toDate();
			endDate = today.endOf("day").toDate();
			break;
		case "last30days":
			startDate = today.subtract(29, "day").startOf("day").toDate();
			endDate = today.endOf("day").toDate();
			break;
		case "thisMonth":
			startDate = today.startOf("month").toDate();
			endDate = today.endOf("month").toDate();
			break;
		case "lastMonth":
			startDate = today.subtract(1, "month").startOf("month").toDate();
			endDate = today.subtract(1, "month").endOf("month").toDate();
			break;
		case "thisYear":
			startDate = today.startOf("year").toDate();
			endDate = today.endOf("year").toDate();
			break;
		default:
			startDate = today.subtract(29, "day").startOf("day").toDate();
			endDate = today.endOf("day").toDate();
	}

	return { startDate, endDate, preset };
}

// ─── Product Report Service ──────────────────────────────────────────────────

export async function generateProductReport(
	dateRange: DateRange,
): Promise<ProductReportResponse> {
	const products = await getProductReportData(
		dateRange.startDate,
		dateRange.endDate,
	);
	const categoryBreakdown = await getCategoryBreakdown();
	const topProducts = products
		.sort((a, b) => b.currentStock - a.currentStock)
		.slice(0, 10)
		.map((p) => ({
			productName: p.productName,
			quantity: p.currentStock,
			value: p.totalValue,
		}));

	// Calculate KPIs
	const totalProducts = products.length;
	const activeProducts = products.filter((p) => p.currentStock > 0).length;
	const lowStockProducts = products.filter(
		(p) => p.currentStock < p.minimumStock,
	).length;
	const totalStockValue = products.reduce((sum, p) => sum + p.totalValue, 0);
	const averageStockLevel =
		products.reduce((sum, p) => sum + p.currentStock, 0) / totalProducts || 0;

	const summary: ProductSummary = {
		totalProducts,
		activeProducts,
		lowStockProducts,
		totalStockValue,
		averageStockLevel,
		categoryBreakdown,
		topProducts,
	};

	const kpis: KPIData[] = [
		{
			label: "Total Products",
			value: totalProducts,
			icon: "Inventory",
			color: "#185FA5",
		},
		{
			label: "Active Stock",
			value: activeProducts,
			icon: "CheckCircle",
			color: "#639922",
		},
		{
			label: "Low Stock Items",
			value: lowStockProducts,
			icon: "Warning",
			color: "#BA7517",
		},
		{
			label: "Total Stock Value",
			value: `$${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			icon: "AttachMoney",
			color: "#185FA5",
		},
	];

	const serializedProducts: SerializedProductReport[] = products.map((p) => ({
		...p,
		lastMovement: p.lastMovement ? p.lastMovement.toISOString() : null,
	}));

	return {
		kpis,
		summary,
		items: serializedProducts,
		dateRange: {
			startDate: dateRange.startDate.toISOString(),
			endDate: dateRange.endDate.toISOString(),
			preset: dateRange.preset,
		},
	};
}

// ─── Expiry Report Service ───────────────────────────────────────────────────

export async function generateExpiryReport(): Promise<ExpiryReportResponse> {
	const items = await getExpiryReportData();

	const totalExpired = items.filter((i) => i.status === "expired").length;
	const totalExpiredValue = items
		.filter((i) => i.status === "expired")
		.reduce((sum, i) => sum + i.totalValue, 0);
	const criticalItems = items.filter((i) => i.status === "critical").length;
	const warningItems = items.filter((i) => i.status === "warning").length;
	const nearExpiryValue = items
		.filter((i) => i.status === "critical" || i.status === "warning")
		.reduce((sum, i) => sum + i.totalValue, 0);

	const statusBreakdown = [
		{ status: "Expired", count: totalExpired, value: totalExpiredValue },
		{
			status: "Critical (≤30 days)",
			count: criticalItems,
			value: items
				.filter((i) => i.status === "critical")
				.reduce((sum, i) => sum + i.totalValue, 0),
		},
		{
			status: "Warning (31-90 days)",
			count: warningItems,
			value: items
				.filter((i) => i.status === "warning")
				.reduce((sum, i) => sum + i.totalValue, 0),
		},
		{
			status: "Normal (>90 days)",
			count: items.filter((i) => i.status === "normal").length,
			value: items
				.filter((i) => i.status === "normal")
				.reduce((sum, i) => sum + i.totalValue, 0),
		},
	];

	const summary: ExpirySummary = {
		totalExpired,
		totalExpiredValue,
		criticalItems,
		warningItems,
		nearExpiryValue,
		statusBreakdown,
	};

	const kpis: KPIData[] = [
		{
			label: "Expired Items",
			value: totalExpired,
			icon: "Error",
			color: "#E24B4A",
		},
		{
			label: "Expired Value",
			value: `$${totalExpiredValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			icon: "MoneyOff",
			color: "#E24B4A",
		},
		{
			label: "Critical (≤30 days)",
			value: criticalItems,
			icon: "Warning",
			color: "#BA7517",
		},
		{
			label: "Warning (31-90 days)",
			value: warningItems,
			icon: "Info",
			color: "#378ADD",
		},
	];

	const serializedItems: SerializedExpiryReport[] = items.map((item) => ({
		...item,
		expiryDate: item.expiryDate.toISOString(),
	}));

	const today = new Date();
	return {
		kpis,
		summary,
		items: serializedItems,
		dateRange: {
			startDate: today.toISOString(),
			endDate: today.toISOString(),
			preset: "today",
		},
	};
}

// ─── Stock Received Report Service ───────────────────────────────────────────

export async function generateStockReceivedReport(
	dateRange: DateRange,
): Promise<StockReceivedReportResponse> {
	const items = await getStockReceivedReportData(
		dateRange.startDate,
		dateRange.endDate,
	);
	const topProducts = await getTopProducts(
		dateRange.startDate,
		dateRange.endDate,
		"receive",
		10,
	);
	const timeSeries = await getTimeSeriesData(
		dateRange.startDate,
		dateRange.endDate,
	);

	const totalReceived = items.reduce((sum, i) => sum + i.quantity, 0);
	const totalReceivedValue = items.reduce((sum, i) => sum + i.totalCost, 0);

	const daysDiff = Math.ceil(
		(dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
			(1000 * 60 * 60 * 24),
	);
	const averageDailyReceived = totalReceived / (daysDiff || 1);

	const summary: Partial<StockMovementSummary> = {
		totalReceived,
		totalReceivedValue,
		averageDailyReceived,
		timeSeries,
		topReceivedProducts: topProducts,
	};

	const kpis: KPIData[] = [
		{
			label: "Total Received",
			value: totalReceived.toLocaleString(),
			icon: "ShoppingCart",
			color: "#639922",
		},
		{
			label: "Total Value",
			value: `$${totalReceivedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
			icon: "AttachMoney",
			color: "#185FA5",
		},
		{
			label: "Avg. Daily Received",
			value: Math.round(averageDailyReceived).toLocaleString(),
			icon: "TrendingUp",
			color: "#378ADD",
		},
		{
			label: "Transactions",
			value: items.length,
			icon: "Receipt",
			color: "#59616F",
		},
	];

	const serializedItems: SerializedStockReceivedReport[] = items.map(
		(item) => ({
			...item,
			date: item.date.toISOString(),
			expiryDate: item.expiryDate ? item.expiryDate.toISOString() : null,
		}),
	);

	return {
		kpis,
		summary,
		items: serializedItems,
		dateRange: {
			startDate: dateRange.startDate.toISOString(),
			endDate: dateRange.endDate.toISOString(),
			preset: dateRange.preset,
		},
	};
}

// ─── Stock Issued Report Service ─────────────────────────────────────────────

export async function generateStockIssuedReport(
	dateRange: DateRange,
): Promise<StockIssuedReportResponse> {
	const items = await getStockIssuedReportData(
		dateRange.startDate,
		dateRange.endDate,
	);
	const topProducts = await getTopProducts(
		dateRange.startDate,
		dateRange.endDate,
		"issue",
		10,
	);
	const timeSeries = await getTimeSeriesData(
		dateRange.startDate,
		dateRange.endDate,
	);

	const totalIssued = items.reduce((sum, i) => sum + i.quantity, 0);
	const totalIssuedValue = items.reduce((sum, i) => sum + i.quantity, 0); // Approximation

	const daysDiff = Math.ceil(
		(dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
			(1000 * 60 * 60 * 24),
	);
	const averageDailyIssued = totalIssued / (daysDiff || 1);

	const summary: Partial<StockMovementSummary> = {
		totalIssued,
		totalIssuedValue,
		averageDailyIssued,
		timeSeries,
		topIssuedProducts: topProducts,
	};

	const kpis: KPIData[] = [
		{
			label: "Total Issued",
			value: totalIssued.toLocaleString(),
			icon: "LocalShipping",
			color: "#E24B4A",
		},
		{
			label: "Avg. Daily Issued",
			value: Math.round(averageDailyIssued).toLocaleString(),
			icon: "TrendingDown",
			color: "#BA7517",
		},
		{
			label: "Transactions",
			value: items.length,
			icon: "Receipt",
			color: "#59616F",
		},
		{
			label: "Unique Products",
			value: new Set(items.map((i) => i.productId)).size,
			icon: "Category",
			color: "#185FA5",
		},
	];

	const serializedItems: SerializedStockIssuedReport[] = items.map((item) => ({
		...item,
		date: item.date.toISOString(),
	}));

	return {
		kpis,
		summary,
		items: serializedItems,
		dateRange: {
			startDate: dateRange.startDate.toISOString(),
			endDate: dateRange.endDate.toISOString(),
			preset: dateRange.preset,
		},
	};
}
