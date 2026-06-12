"use client";

import { create } from "zustand";
import type { DateRangePreset } from "@/features/reports/types";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReportsTabValue = "products" | "expiry" | "received" | "issued";

export interface ReportFilterState {
	preset: DateRangePreset;
	customStart: Date | null;
	customEnd: Date | null;
}

interface ReportsUIStore {
	// ── Tab ──────────────────────────────────────────────────────────────────
	activeTab: ReportsTabValue;
	setActiveTab: (tab: ReportsTabValue) => void;

	// ── Product filter ────────────────────────────────────────────────────────
	productFilter: ReportFilterState;
	setProductPreset: (preset: DateRangePreset) => void;
	setProductCustomDateRange: (start: Date | null, end: Date | null) => void;

	// ── Stock Received filter ─────────────────────────────────────────────────
	receivedFilter: ReportFilterState;
	setReceivedPreset: (preset: DateRangePreset) => void;
	setReceivedCustomDateRange: (start: Date | null, end: Date | null) => void;

	// ── Stock Issued filter ───────────────────────────────────────────────────
	issuedFilter: ReportFilterState;
	setIssuedPreset: (preset: DateRangePreset) => void;
	setIssuedCustomDateRange: (start: Date | null, end: Date | null) => void;

	// ── Expiry filter ───────────────────────────────────────────────────
	expiryFilter: ReportFilterState;
	setExpiryPreset: (preset: DateRangePreset) => void;
	setExpiryCustomDateRange: (start: Date | null, end: Date | null) => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultFilter: ReportFilterState = {
	preset: "last30days",
	customStart: null,
	customEnd: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useReportsStore = create<ReportsUIStore>((set) => ({
	// Tab
	activeTab: "products",
	setActiveTab: (tab) => set({ activeTab: tab }),

	// Product filter
	productFilter: { ...defaultFilter },
	setProductPreset: (preset) =>
		set((state) => ({ productFilter: { ...state.productFilter, preset } })),
	setProductCustomDateRange: (start, end) =>
		set((state) => ({
			productFilter: {
				...state.productFilter,
				customStart: start,
				customEnd: end,
			},
		})),

	// Stock Received filter
	receivedFilter: { ...defaultFilter },
	setReceivedPreset: (preset) =>
		set((state) => ({
			receivedFilter: { ...state.receivedFilter, preset },
		})),
	setReceivedCustomDateRange: (start, end) =>
		set((state) => ({
			receivedFilter: {
				...state.receivedFilter,
				customStart: start,
				customEnd: end,
			},
		})),

	// Stock Issued filter
	issuedFilter: { ...defaultFilter },
	setIssuedPreset: (preset) =>
		set((state) => ({ issuedFilter: { ...state.issuedFilter, preset } })),
	setIssuedCustomDateRange: (start, end) =>
		set((state) => ({
			issuedFilter: {
				...state.issuedFilter,
				customStart: start,
				customEnd: end,
			},
		})),

	// Expiry filter
	expiryFilter: { ...defaultFilter },
	setExpiryPreset: (preset) =>
		set((state) => ({ expiryFilter: { ...state.expiryFilter, preset } })),
	setExpiryCustomDateRange: (start, end) =>
		set((state) => ({
			expiryFilter: {
				...state.expiryFilter,
				customStart: start,
				customEnd: end,
			},
		})),
}));
