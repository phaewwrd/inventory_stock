"use server";

import {
	generateStockReceivedReport,
	getDateRangeFromPreset,
} from "../service";
import type {
	ActionResult,
	DateRange,
	DateRangePreset,
	StockReceivedReportResponse,
} from "../types";

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
			dateRange = await getDateRangeFromPreset(preset);
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
