"use client";
import { useQuery } from "@tanstack/react-query";
import type {
	DateRangePreset,
	ExpiryReportResponse,
	ProductReportResponse,
	StockIssuedReportResponse,
	StockReceivedReportResponse,
} from "@/features/reports/types";

// ─── Query Key Factory ───────────────────────────────────────────────────────
// Centralised key factory keeps keys consistent and easy to invalidate.

interface FilterParams {
	preset: DateRangePreset;
	customStart: Date | null;
	customEnd: Date | null;
}

function buildReportQueryString(filter?: FilterParams) {
	if (!filter) {
		return "";
	}

	const searchParams = new URLSearchParams({
		preset: filter.preset,
	});

	if (filter.customStart) {
		searchParams.set("customStart", filter.customStart.toISOString());
	}

	if (filter.customEnd) {
		searchParams.set("customEnd", filter.customEnd.toISOString());
	}

	return `?${searchParams.toString()}`;
}

export async function fetchReport<T>(
	report: string,
	filter?: FilterParams,
): Promise<T> {
	const queryString = buildReportQueryString(filter);

	const response = await fetch(`/api/reports/${report}${queryString}`, {
		method: "GET",
		cache: "no-store",
		credentials: "include",
	});

	const result = await response.json();
	return result.data;
}

export const reportQueryKeys = {
	all: ["reports"] as const,
	product: (filter: FilterParams) =>
		[
			"reports",
			"products",
			{
				preset: filter.preset,
				// Serialise dates to ISO strings — plain objects must be JSON-serialisable
				// for TanStack Query's key hashing to work correctly.
				customStart: filter.customStart?.toISOString() ?? null,
				customEnd: filter.customEnd?.toISOString() ?? null,
			},
		] as const,
	expiry: (filter: FilterParams) =>
		[
			"reports",
			"expiry",
			{
				preset: filter.preset,
				customStart: filter.customStart?.toISOString() ?? null,
				customEnd: filter.customEnd?.toISOString() ?? null,
			},
		] as const,
	issued: (filter: FilterParams) =>
		[
			"reports",
			"issued",
			{
				preset: filter.preset,
				customStart: filter.customStart?.toISOString() ?? null,
				customEnd: filter.customEnd?.toISOString() ?? null,
			},
		] as const,
	received: (filter: FilterParams) =>
		[
			"reports",
			"received",
			{
				preset: filter.preset,
				customStart: filter.customStart?.toISOString() ?? null,
				customEnd: filter.customEnd?.toISOString() ?? null,
			},
		] as const,
};

// ─── useProductReport ────────────────────────────────────────────────────────

export function useProductReport(filter: FilterParams) {
	return useQuery<ProductReportResponse, Error>({
		queryKey: reportQueryKeys.product(filter),
		queryFn: () => fetchReport<ProductReportResponse>("products", filter),
		// Only fetch when custom preset has both dates, otherwise fetch immediately.
		enabled:
			filter.preset !== "custom" ||
			(filter.customStart !== null && filter.customEnd !== null),
	});
}

// ─── useExpiryReport ─────────────────────────────────────────────────────────

export function useExpiryReport(filter: FilterParams) {
	return useQuery<ExpiryReportResponse, Error>({
		queryKey: reportQueryKeys.expiry(filter),
		queryFn: () => fetchReport<ExpiryReportResponse>("expiry", filter),
	});
}

// ─── useStockReceivedReport ──────────────────────────────────────────────────

export function useStockReceivedReport(filter: FilterParams) {
	return useQuery<StockReceivedReportResponse, Error>({
		queryKey: reportQueryKeys.received(filter),
		queryFn: () => fetchReport<StockReceivedReportResponse>("received", filter),
		enabled:
			filter.preset !== "custom" ||
			(filter.customStart !== null && filter.customEnd !== null),
	});
}

// ─── useStockIssuedReport ────────────────────────────────────────────────────

export function useStockIssuedReport(filter: FilterParams) {
	return useQuery<StockIssuedReportResponse, Error>({
		queryKey: reportQueryKeys.issued(filter),
		queryFn: () => fetchReport<StockIssuedReportResponse>("issued", filter),
		enabled:
			filter.preset !== "custom" ||
			(filter.customStart !== null && filter.customEnd !== null),
	});
}
