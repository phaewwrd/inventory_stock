import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
	generateExpiryReport,
	generateProductReport,
	generateStockIssuedReport,
	generateStockReceivedReport,
	getDateRangeFromPreset,
} from "@/features/reports/service";
import type {
	ActionResult,
	DateRange,
	DateRangePreset,
	ExpiryReportResponse,
	ProductReportResponse,
	StockIssuedReportResponse,
	StockReceivedReportResponse,
} from "@/features/reports/types";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReportKind = "products" | "expiry" | "received" | "issued";
type ReportResponse =
	| ProductReportResponse
	| ExpiryReportResponse
	| StockReceivedReportResponse
	| StockIssuedReportResponse;

const validPresets = new Set<DateRangePreset>([
	"today",
	"yesterday",
	"last7days",
	"last30days",
	"thisMonth",
	"lastMonth",
	"thisYear",
	"custom",
]);

function jsonError(message: string, status: number) {
	return NextResponse.json<ActionResult>(
		{ success: false, error: message },
		{ status },
	);
}

function parsePreset(value: string | null): DateRangePreset {
	if (value && validPresets.has(value as DateRangePreset)) {
		return value as DateRangePreset;
	}

	return "last30days";
}

async function getDateRange(
	searchParams: URLSearchParams,
): Promise<ActionResult<DateRange>> {
	const preset = parsePreset(searchParams.get("preset"));

	if (preset !== "custom") {
		return {
			success: true,
			data: await getDateRangeFromPreset(preset),
		};
	}

	const customStart = searchParams.get("customStart");
	const customEnd = searchParams.get("customEnd");

	if (!customStart || !customEnd) {
		return {
			success: false,
			error: "Custom date range requires both start and end dates",
		};
	}

	const startDate = new Date(customStart);
	const endDate = new Date(customEnd);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return {
			success: false,
			error: "Custom date range contains an invalid date",
		};
	}

	return {
		success: true,
		data: {
			startDate,
			endDate,
			preset,
		},
	};
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ report: string }> },
) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		return jsonError("Unauthorized", 401);
	}

	const { report } = await params;
	const { searchParams } = new URL(request.url);

	try {
		let data: ReportResponse;

		switch (report as ReportKind) {
			case "products": {
				const dateRange = await getDateRange(searchParams);
				if (!dateRange.success) {
					return jsonError(dateRange.error, 400);
				}

				data = await generateProductReport(dateRange.data);
				break;
			}
			case "expiry":
				data = await generateExpiryReport();
				break;
			case "received": {
				const dateRange = await getDateRange(searchParams);
				if (!dateRange.success) {
					return jsonError(dateRange.error, 400);
				}

				data = await generateStockReceivedReport(dateRange.data);
				break;
			}
			case "issued": {
				const dateRange = await getDateRange(searchParams);
				if (!dateRange.success) {
					return jsonError(dateRange.error, 400);
				}

				data = await generateStockIssuedReport(dateRange.data);
				break;
			}
			default:
				return jsonError("Report not found", 404);
		}

		return NextResponse.json<ActionResult<ReportResponse>>({
			success: true,
			data,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to fetch report";

		return jsonError(message, 500);
	}
}
