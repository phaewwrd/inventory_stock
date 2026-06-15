import type { PaginatedResult } from "@/lib/query/types";

export type MovementType = "receive" | "issue" | "adjustment";
export type MovementStatus = "pending" | "approved" | "unapproved";

// ─── Product picker ────────────────────────────────────────────────────────────

export interface ProductPickerOption {
	id: string;
	sku: string;
	name: string;
	unit: string;
	totalBalance: number;
}

// ─── Receive ───────────────────────────────────────────────────────────────────

export interface ReceiveInput {
	productId: string;
	quantity: number;
	lotNo: string;
	expiryDate: string | null; // optional
	unitCost: string | null; // numeric stored as string
	referenceNo: string | null;
	reason: string | null; // "Source" in the receive UI
	remark: string | null;
}

/** Fields a server validation error can be attributed to. */
export type ReceiveFormField =
	| "productId"
	| "quantity"
	| "lotNo"
	| "expiryDate"
	| "unitCost";

// ─── Cut ───────────────────────────────────────────────────────────────────────

export interface CutInput {
	productId: string;
	quantity: number;
	reason: string | null;
	referenceNo: string | null;
	remark: string | null;
}

export type CutFormField = "productId" | "quantity";

// ─── Approvals ─────────────────────────────────────────────────────────────────

export interface PendingMovement {
	id: string;
	movementType: MovementType;
	productSku: string;
	productName: string;
	unit: string;
	quantity: number;
	reqLotNo: string | null;
	reqExpiryDate: string | null;
	reason: string | null;
	referenceNo: string | null;
	requestedByName: string | null;
	createdAt: string; // ISO
}

export type PendingMovementList = PaginatedResult<PendingMovement>;

export interface PendingListParams {
	page: number;
	limit: number;
}

// ─── Movement log ──────────────────────────────────────────────────────────────

export type MovementTypeFilter = "all" | "receive" | "issue";
export type MovementStatusFilter = "all" | MovementStatus;

export const MOVEMENT_TYPE_FILTERS = [
	"all",
	"receive",
	"issue",
] as const satisfies Array<MovementTypeFilter>;

export const MOVEMENT_STATUS_FILTERS = [
	"all",
	"pending",
	"approved",
	"unapproved",
] as const satisfies Array<MovementStatusFilter>;

export interface MovementLogRow {
	id: string;
	createdAt: string; // ISO
	movementType: MovementType;
	status: MovementStatus;
	productSku: string;
	productName: string;
	unit: string;
	lotNo: string | null;
	quantity: number;
	balanceAfter: number | null;
	requestedByName: string | null;
}

export type MovementLogList = PaginatedResult<MovementLogRow>;

export interface MovementLogParams {
	q: string;
	type: MovementTypeFilter;
	status: MovementStatusFilter;
	page: number;
	limit: number;
}

// ─── Action result ───────────────────────────────────────────────────────────

export type StockActionResult<T = void> =
	| { success: true; data: T }
	| { success: false; error: string; field?: ReceiveFormField };
