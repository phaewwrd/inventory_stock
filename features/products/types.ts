import type {
	PaginatedResult,
	SortDirection as QuerySortDirection,
} from "@/lib/query/types";

export type SortDirection = QuerySortDirection;

export type ProductStatus =
	| "out_of_stock"
	| "expired"
	| "low_stock"
	| "near_expiry"
	| "active";

export type ProductStatusFilter = "all" | ProductStatus;

export type ProductSortField = "code" | "name" | "expire" | "balance";

export const PRODUCT_SORT_FIELDS = [
	"code",
	"name",
	"expire",
	"balance",
] as const satisfies Array<ProductSortField>;

export const PRODUCT_STATUS_FILTERS = [
	"all",
	"active",
	"low_stock",
	"near_expiry",
	"expired",
	"out_of_stock",
] as const satisfies Array<ProductStatusFilter>;

// ─── List row (one product, aggregated) ───────────────────────────────────────

export interface ProductListItem {
	id: string;
	sku: string;
	name: string;
	unit: string;
	size: string | null;
	minimumStock: number;
	totalBalance: number;
	representativeLot: {
		lotNo: string;
		expiryDate: string | null;
	} | null;
	status: ProductStatus;
}

export type ProductListResult = PaginatedResult<ProductListItem>;

// ─── Detail (modal) ──────────────────────────────────────────────────────────

export interface ProductLotRow {
	id: string;
	lotNo: string;
	expiryDate: string | null;
	receivedDate: string;
	quantity: number;
	remainingQty: number;
	unitCost: string | null;
}

export interface ProductMovementRow {
	id: string;
	movementType: "receive" | "issue" | "adjustment";
	quantity: number;
	balanceAfter: number | null; // null while the movement is pending
	lotNo: string | null;
	remark: string | null;
	createdByName: string | null;
	createdAt: string;
}

export interface ProductDetail {
	id: string;
	sku: string;
	name: string;
	unit: string;
	size: string | null;
	categoryName: string | null;
	minimumStock: number;
	latestCost: string | null;
	note: string | null;
	isActive: boolean;
	totalBalance: number;
	status: ProductStatus;
	lots: Array<ProductLotRow>;
	recentMovements: Array<ProductMovementRow>;
}

// ─── Query params ────────────────────────────────────────────────────────────

export interface ProductListParams {
	q: string;
	status: ProductStatusFilter;
	sort: ProductSortField;
	dir: SortDirection;
	page: number;
	limit: number;
}

export const DEFAULT_PRODUCT_LIST_PARAMS: ProductListParams = {
	q: "",
	status: "all",
	sort: "name",
	dir: "asc",
	page: 1,
	limit: 10,
};

export const NEAR_EXPIRY_DAYS = 30;

// ─── Create product ──────────────────────────────────────────────────────────

export interface CategoryOption {
	id: string;
	name: string;
}

/** Flat product master record (no aggregates/lots). */
export interface ProductRecord {
	id: string;
	sku: string;
	name: string;
	unit: string;
	size: string | null;
	categoryName: string | null;
	minimumStock: number;
	latestCost: string | null;
	note: string | null;
	isActive: boolean;
}

export interface CreateProductInput {
	sku: string; // "" => server auto-generates (FD####)
	name: string;
	categoryId: string;
	unit: string;
	minimumStock: number;
	size: string | null;
	latestCost: string | null; // numeric stored as string (Drizzle numeric)
	note: string | null;
	isActive: boolean;
}

/** Form fields that a server error can be attributed to. */
export type ProductFormField =
	| "sku"
	| "name"
	| "categoryId"
	| "unit"
	| "minimumStock"
	| "latestCost";

/**
 * Result of a create attempt. `field` (when present) lets the client surface the
 * message under a specific input; otherwise it's a general error (toast/banner).
 */
export type CreateProductResult =
	| { success: true; data: ProductRecord }
	| { success: false; error: string; field?: ProductFormField };

// ─── Action result ───────────────────────────────────────────────────────────

export type ActionResult<T = void> =
	| { success: true; data: T }
	| { success: false; error: string };
