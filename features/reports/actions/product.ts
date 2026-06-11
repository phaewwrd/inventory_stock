"use server";

import { generateProductReport, getDateRangeFromPreset } from "../service";
import type {
	ActionResult,
	DateRange,
	DateRangePreset,
	ProductReportResponse,
} from "../types";

export async function fetchProductReport(
	preset: DateRangePreset = "last30days",
	customStartDate?: string,
	customEndDate?: string,
): Promise<ActionResult<ProductReportResponse>> {
	try {
		console.log("getDateRangeFromPreset", typeof getDateRangeFromPreset);
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
