import "server-only";

import type { PaginatedResult } from "./types";

interface PaginateOptions<T> {
	listQuery: (args: { limit: number; offset: number }) => Promise<Array<T>>;
	countQuery: () => Promise<number>;
	page: number;
	limit: number;
}

export async function paginate<T>(
	options: PaginateOptions<T>,
): Promise<PaginatedResult<T>> {
	const offset = (options.page - 1) * options.limit;
	const [items, total] = await Promise.all([
		options.listQuery({ limit: options.limit, offset }),
		options.countQuery(),
	]);
	return {
		items,
		total,
		page: options.page,
		limit: options.limit,
	};
}
