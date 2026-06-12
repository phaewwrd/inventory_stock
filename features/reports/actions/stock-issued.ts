"use server";

import { generateStockIssuedReport, getDateRangeFromPreset } from "../service";
import type {
	ActionResult,
	DateRange,
	DateRangePreset,
	StockIssuedReportResponse,
} from "../types";

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
			dateRange = await getDateRangeFromPreset(preset);
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
