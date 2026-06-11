"use server";

import { generateExpiryReport } from "../service";
import type { ActionResult, ExpiryReportResponse } from "../types";

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
