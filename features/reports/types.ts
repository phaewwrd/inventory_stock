// ─── Date Range Types ────────────────────────────────────────────────────────

export type DateRangePreset =
	| "today"
	| "yesterday"
	| "last7days"
	| "last30days"
	| "thisMonth"
	| "lastMonth"
	| "thisYear"
	| "custom";

export interface DateRange {
	startDate: Date;
	endDate: Date;
	preset: DateRangePreset;
}

export interface SerializedDateRange {
	startDate: string;
	endDate: string;
	preset: DateRangePreset;
}

// ─── KPI Types ───────────────────────────────────────────────────────────────

export interface KPIData {
	label: string;
	value: number | string;
	change?: number;
	changeLabel?: string;
	trend?: "up" | "down" | "neutral";
	icon?: string;
	color?: string;
}

// ─── Report Data Types ───────────────────────────────────────────────────────

export interface ProductReport {
	productId: string;
	productName: string;
	sku: string;
	category: string;
	totalReceived: number;
	totalIssued: number;
	currentStock: number;
	minimumStock: number;
	latestCost: number;
	totalValue: number;
	unit: string;
	lastMovement?: Date | null;
}

export interface SerializedProductReport
	extends Omit<ProductReport, "lastMovement">,
		Record<string, unknown> {
	lastMovement?: string | null;
}

export interface ExpiryReport {
	lotId: string;
	lotNo: string;
	productId: string;
	productName: string;
	sku: string;
	category: string;
	expiryDate: Date;
	remainingQty: number;
	unitCost: number;
	totalValue: number;
	unit: string;
	daysUntilExpiry: number;
	status: "expired" | "critical" | "warning" | "normal";
}

export interface SerializedExpiryReport
	extends Omit<ExpiryReport, "expiryDate">,
		Record<string, unknown> {
	expiryDate: string;
}

export interface StockReceivedReport {
	id: string;
	date: Date;
	productId: string;
	productName: string;
	sku: string;
	lotNo: string;
	quantity: number;
	unitCost: number;
	totalCost: number;
	unit: string;
	expiryDate?: Date | null;
	createdBy?: string | null;
	createdByName?: string | null;
}

export interface SerializedStockReceivedReport
	extends Omit<StockReceivedReport, "date" | "expiryDate">,
		Record<string, unknown> {
	date: string;
	expiryDate?: string | null;
}

export interface StockIssuedReport {
	id: string;
	date: Date;
	productId: string;
	productName: string;
	sku: string;
	lotNo?: string | null;
	quantity: number;
	balanceAfter: number;
	unit: string;
	remark?: string | null;
	createdBy?: string | null;
	createdByName?: string | null;
}

export interface SerializedStockIssuedReport
	extends Omit<StockIssuedReport, "date">,
		Record<string, unknown> {
	date: string;
}

// ─── Chart Data Types ────────────────────────────────────────────────────────

export interface TimeSeriesData extends Record<string, string | number> {
	date: string;
	received: number;
	issued: number;
	balance: number;
}

export interface CategoryData {
	category: string;
	count: number;
	value: number;
}

export interface TopProductData {
	productName: string;
	quantity: number;
	value: number;
}

export interface ExpiryStatusData {
	status: string;
	count: number;
	value: number;
}

export interface CandlestickData {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
}

// ─── Summary Types ───────────────────────────────────────────────────────────

export interface ProductSummary {
	totalProducts: number;
	activeProducts: number;
	lowStockProducts: number;
	totalStockValue: number;
	averageStockLevel: number;
	categoryBreakdown: CategoryData[];
	topProducts: TopProductData[];
}

export interface ExpirySummary {
	totalExpired: number;
	totalExpiredValue: number;
	criticalItems: number;
	warningItems: number;
	nearExpiryValue: number;
	statusBreakdown: ExpiryStatusData[];
}

export interface StockMovementSummary {
	totalReceived: number;
	totalReceivedValue: number;
	totalIssued: number;
	totalIssuedValue: number;
	netChange: number;
	averageDailyReceived: number;
	averageDailyIssued: number;
	timeSeries: TimeSeriesData[];
	topReceivedProducts: TopProductData[];
	topIssuedProducts: TopProductData[];
}

// ─── Report Response Types ───────────────────────────────────────────────────

export interface ProductReportResponse {
	kpis: KPIData[];
	summary: ProductSummary;
	products: SerializedProductReport[];
	dateRange: SerializedDateRange;
}

export interface ExpiryReportResponse {
	kpis: KPIData[];
	summary: ExpirySummary;
	items: SerializedExpiryReport[];
	dateRange: SerializedDateRange;
}

export interface StockReceivedReportResponse {
	kpis: KPIData[];
	summary: Partial<StockMovementSummary>;
	items: SerializedStockReceivedReport[];
	dateRange: SerializedDateRange;
}

export interface StockIssuedReportResponse {
	kpis: KPIData[];
	summary: Partial<StockMovementSummary>;
	items: SerializedStockIssuedReport[];
	dateRange: SerializedDateRange;
}

// ─── Action Result ───────────────────────────────────────────────────────────

export type ActionResult<T = void> =
	| { success: true; data: T }
	| { success: false; error: string };
