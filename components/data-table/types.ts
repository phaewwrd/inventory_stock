import type { ReactNode } from "react";

export type ColumnAlign = "left" | "right" | "center";

export interface ColumnDef<TRow, TSortField extends string = string> {
	id: string;
	label: ReactNode;
	sortField?: TSortField;
	align?: ColumnAlign;
	width?: number | string;
	render: (row: TRow) => ReactNode;
}
