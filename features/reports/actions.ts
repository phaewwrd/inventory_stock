"use server";

import type {
	ActionResult,
	DateRange,
	DateRangePreset,
	ExpiryReportResponse,
	ProductReportResponse,
	StockIssuedReportResponse,
	StockReceivedReportResponse,
} from "./types";
import {
	generateExpiryReport,
	generateProductReport,
	generateStockIssuedReport,
	generateStockReceivedReport,
	getDateRangeFromPreset,
} from "./service";

export async function fetchProductReport(
	preset: DateRangePreset = "last30days",
	customStartDate?: string,
	customEndDate?: string,
): Promise<ActionResult<ProductReportResponse>> {
	try {
		let dateRange: DateRange;

		if (preset === "custom" && customStartDate && customEndDate) {
			dateRange = {
				startDate: new Date(customStartDate),
				endDate: new Date(customEndDate),
				preset: "custom",
			};
		} else {
			dateRange = getDateRangeFromPreset(preset);
		}

		const report = await generateProductReport(dateRange);
		return { success: true, data: report };
	} catch (error) {
		console.error("Error fetching product report:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to generate product report",
		};
	}
}

export async function fetchExpiryReport(): Promise<
	ActionResult<ExpiryReportResponse>
> {
	try {
		const report = await generateExpiryReport();
		return { success: true, data: report };
	} catch (error) {
		console.error("Error fetching expiry report:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to generate expiry report",
		};
	}
}

export async function fetchStockReceivedReport(
	preset: DateRangePreset = "last30days",
	customStartDate?: string,
	customEndDate?: string,
): Promise<ActionResult<StockReceivedReportResponse>> {
	try {
		let dateRange: DateRange;

		if (preset === "custom" && customStartDate && customEndDate) {
			dateRange = {
				startDate: new Date(customStartDate),
				endDate: new Date(customEndDate),
				preset: "custom",
			};
		} else {
			dateRange = getDateRangeFromPreset(preset);
		}

		const report = await generateStockReceivedReport(dateRange);
		return { success: true, data: report };
	} catch (error) {
		console.error("Error fetching stock received report:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to generate stock received report",
		};
	}
}

export async function fetchStockIssuedReport(
	preset: DateRangePreset = "last30days",
	customStartDate?: string,
	customEndDate?: string,
): Promise<ActionResult<StockIssuedReportResponse>> {
	try {
		let dateRange: DateRange;

		if (preset === "custom" && customStartDate && customEndDate) {
			dateRange = {
				startDate: new Date(customStartDate),
				endDate: new Date(customEndDate),
				preset: "custom",
			};
		} else {
			dateRange = getDateRangeFromPreset(preset);
		}

		const report = await generateStockIssuedReport(dateRange);
		return { success: true, data: report };
	} catch (error) {
		console.error("Error fetching stock issued report:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to generate stock issued report",
		};
	}
}
