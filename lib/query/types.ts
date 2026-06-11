export type SortDirection = "asc" | "desc";

export interface PaginationParams {
	page: number;
	limit: number;
}

export interface SortParams<TField extends string> {
	sort: TField;
	dir: SortDirection;
}

export interface PaginatedResult<T> {
	items: Array<T>;
	total: number;
	page: number;
	limit: number;
}

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
