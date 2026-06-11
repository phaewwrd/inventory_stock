"use client";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import type { SortDirection } from "@/lib/query/types";

import type { ColumnDef } from "./types";

interface DataTableProps<TRow, TSortField extends string> {
	items: Array<TRow>;
	columns: Array<ColumnDef<TRow, TSortField>>;
	getRowId: (row: TRow) => string;
	sort?: TSortField;
	dir?: SortDirection;
	onSortChange?: (field: TSortField) => void;
	onRowClick?: (row: TRow) => void;
	emptyMessage?: ReactNode;
	size?: "small" | "medium";
}

export function DataTable<TRow, TSortField extends string = string>({
	items,
	columns,
	getRowId,
	sort,
	dir = "asc",
	onSortChange,
	onRowClick,
	emptyMessage = "No records found.",
	size = "small",
}: DataTableProps<TRow, TSortField>) {
	return (
		<TableContainer>
			<Table size={size}>
				<TableHead>
					<TableRow>
						{columns.map((col) => {
							const align = col.align ?? "left";
							const sortable = col.sortField !== undefined;
							const isActive = sortable && sort === col.sortField;
							return (
								<TableCell
									key={col.id}
									align={align}
									sortDirection={isActive ? dir : false}
									sx={{
										width: col.width,
										fontWeight: 600,
										textTransform: "uppercase",
										backgroundColor: "background.default",
										color: "semantic.textTertiary",
										borderBottom: "none",
										padding: 2,
									}}
								>
									{sortable && onSortChange ? (
										<TableSortLabel
											active={isActive}
											direction={isActive ? dir : "asc"}
											onClick={() =>
												col.sortField && onSortChange(col.sortField)
											}
										>
											{col.label}
										</TableSortLabel>
									) : (
										col.label
									)}
								</TableCell>
							);
						})}
					</TableRow>
				</TableHead>

				<TableBody>
					{items.length === 0 ? (
						<TableRow>
							<TableCell colSpan={columns.length}>
								<Box sx={{ textAlign: "center", py: 6 }}>
									<Typography variant="body2" color="text.secondary">
										{emptyMessage}
									</Typography>
								</Box>
							</TableCell>
						</TableRow>
					) : (
						items.map((row) => (
							<TableRow
								key={getRowId(row)}
								hover={onRowClick !== undefined}
								sx={{ cursor: onRowClick ? "pointer" : "default" }}
								onClick={onRowClick ? () => onRowClick(row) : undefined}
							>
								{columns.map((col) => (
									<TableCell key={col.id} align={col.align ?? "left"}>
										{col.render(row)}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
