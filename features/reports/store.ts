"use client";

import { create } from "zustand";
import {
	fetchExpiryReport,
	fetchProductReport,
	fetchStockIssuedReport,
	fetchStockReceivedReport,
} from "@/features/reports/actions";
import type {
	DateRangePreset,
	ExpiryReportResponse,
	ProductReportResponse,
	StockIssuedReportResponse,
	StockReceivedReportResponse,
} from "@/features/reports/types";

export type ReportsTabValue = "products" | "expiry" | "received" | "issued";

interface ReportFilterState {
	preset: DateRangePreset;
	customStart: Date | null;
	customEnd: Date | null;
}

interface ReportsStore {
	activeTab: ReportsTabValue;
	error: string | null;
	isInitializing: boolean;
	loading: Record<ReportsTabValue, boolean>;
	productReport: ProductReportResponse | null;
	expiryReport: ExpiryReportResponse | null;
	receivedReport: StockReceivedReportResponse | null;
	issuedReport: StockIssuedReportResponse | null;
	productFilter: ReportFilterState;
	receivedFilter: ReportFilterState;
	issuedFilter: ReportFilterState;
	setActiveTab: (tab: ReportsTabValue) => void;
	setProductPreset: (preset: DateRangePreset) => void;
	setProductCustomDateRange: (start: Date | null, end: Date | null) => void;
	setReceivedPreset: (preset: DateRangePreset) => void;
	setReceivedCustomDateRange: (start: Date | null, end: Date | null) => void;
	setIssuedPreset: (preset: DateRangePreset) => void;
	setIssuedCustomDateRange: (start: Date | null, end: Date | null) => void;
	loadProductReport: () => Promise<void>;
	loadExpiryReport: () => Promise<void>;
	loadReceivedReport: () => Promise<void>;
	loadIssuedReport: () => Promise<void>;
	initializeReports: () => Promise<void>;
}

const defaultFilterState: ReportFilterState = {
	preset: "last30days",
	customStart: null,
	customEnd: null,
};

export const useReportsStore = create<ReportsStore>((set, get) => ({
	activeTab: "products",
	error: null,
	isInitializing: false,
	loading: {
		products: false,
		expiry: false,
		received: false,
		issued: false,
	},
	productReport: null,
	expiryReport: null,
	receivedReport: null,
	issuedReport: null,
	productFilter: defaultFilterState,
	receivedFilter: defaultFilterState,
	issuedFilter: defaultFilterState,
	setActiveTab: (tab) => set({ activeTab: tab }),
	setProductPreset: (preset) =>
		set((state) => ({
			productFilter: { ...state.productFilter, preset },
		})),
	setProductCustomDateRange: (start, end) =>
		set((state) => ({
			productFilter: {
				...state.productFilter,
				customStart: start,
				customEnd: end,
			},
		})),
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
	setIssuedPreset: (preset) =>
		set((state) => ({
			issuedFilter: { ...state.issuedFilter, preset },
		})),
	setIssuedCustomDateRange: (start, end) =>
		set((state) => ({
			issuedFilter: {
				...state.issuedFilter,
				customStart: start,
				customEnd: end,
			},
		})),
	loadProductReport: async () => {
		const { productFilter } = get();
		set((state) => ({
			error: null,
			loading: { ...state.loading, products: true },
		}));

		try {
			const result = await fetchProductReport(
				productFilter.preset,
				productFilter.customStart?.toISOString(),
				productFilter.customEnd?.toISOString(),
			);

			if (result.success) {
				set({ productReport: result.data });
				return;
			}

			set({ error: result.error });
		} catch {
			set({ error: "Failed to load product report" });
		} finally {
			set((state) => ({
				loading: { ...state.loading, products: false },
			}));
		}
	},
	loadExpiryReport: async () => {
		set((state) => ({
			error: null,
			loading: { ...state.loading, expiry: true },
		}));

		try {
			const result = await fetchExpiryReport();

			if (result.success) {
				set({ expiryReport: result.data });
				return;
			}

			set({ error: result.error });
		} catch {
			set({ error: "Failed to load expiry report" });
		} finally {
			set((state) => ({
				loading: { ...state.loading, expiry: false },
			}));
		}
	},
	loadReceivedReport: async () => {
		const { receivedFilter } = get();
		set((state) => ({
			error: null,
			loading: { ...state.loading, received: true },
		}));

		try {
			const result = await fetchStockReceivedReport(
				receivedFilter.preset,
				receivedFilter.customStart?.toISOString(),
				receivedFilter.customEnd?.toISOString(),
			);

			if (result.success) {
				set({ receivedReport: result.data });
				return;
			}

			set({ error: result.error });
		} catch {
			set({ error: "Failed to load stock received report" });
		} finally {
			set((state) => ({
				loading: { ...state.loading, received: false },
			}));
		}
	},
	loadIssuedReport: async () => {
		const { issuedFilter } = get();
		set((state) => ({
			error: null,
			loading: { ...state.loading, issued: true },
		}));

		try {
			const result = await fetchStockIssuedReport(
				issuedFilter.preset,
				issuedFilter.customStart?.toISOString(),
				issuedFilter.customEnd?.toISOString(),
			);

			if (result.success) {
				set({ issuedReport: result.data });
				return;
			}

			set({ error: result.error });
		} catch {
			set({ error: "Failed to load stock issued report" });
		} finally {
			set((state) => ({
				loading: { ...state.loading, issued: false },
			}));
		}
	},
	initializeReports: async () => {
		set({ isInitializing: true, error: null });
		await Promise.allSettled([
			get().loadProductReport(),
			get().loadExpiryReport(),
			get().loadReceivedReport(),
			get().loadIssuedReport(),
		]);
		set({ isInitializing: false });
	},
}));