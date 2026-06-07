import ExcelJS from "exceljs";
import dayjs from "dayjs";
import type {
	SerializedExpiryReport,
	SerializedProductReport,
	SerializedStockIssuedReport,
	SerializedStockReceivedReport,
} from "@/features/reports/types";

// ─── Helper Functions ────────────────────────────────────────────────────────

function styleHeaderRow(worksheet: ExcelJS.Worksheet, rowNum: number) {
	const headerRow = worksheet.getRow(rowNum);
	headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
	headerRow.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF185FA5" },
	};
	headerRow.alignment = { vertical: "middle", horizontal: "center" };
	headerRow.height = 25;
}

function autoFitColumns(worksheet: ExcelJS.Worksheet) {
	worksheet.columns.forEach((column) => {
		let maxLength = 0;
		column.eachCell?.({ includeEmpty: true }, (cell) => {
			const cellValue = cell.value ? String(cell.value) : "";
			if (cellValue.length > maxLength) {
				maxLength = cellValue.length;
			}
		});
		column.width = Math.min(Math.max(maxLength + 2, 10), 50);
	});
}

async function downloadWorkbook(
	workbook: ExcelJS.Workbook,
	filename: string,
) {
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

function formatDate(value: Date | string, pattern: string) {
	return dayjs(value).format(pattern);
}

// ─── Product Report Export ───────────────────────────────────────────────────

export async function exportProductReportToExcel(
	data: SerializedProductReport[],
	dateRange: { startDate: string; endDate: string },
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Product Report");

	// Add title
	worksheet.mergeCells("A1:K1");
	const titleCell = worksheet.getCell("A1");
	titleCell.value = "Product Report";
	titleCell.font = { size: 16, bold: true };
	titleCell.alignment = { horizontal: "center", vertical: "middle" };
	worksheet.getRow(1).height = 30;

	// Add date range
	worksheet.mergeCells("A2:K2");
	const dateCell = worksheet.getCell("A2");
	dateCell.value = `Period: ${formatDate(dateRange.startDate, "MMM DD, YYYY")} - ${formatDate(dateRange.endDate, "MMM DD, YYYY")}`;
	dateCell.alignment = { horizontal: "center" };
	dateCell.font = { italic: true };

	// Add headers
	const headers = [
		"Product Name",
		"SKU",
		"Category",
		"Total Received",
		"Total Issued",
		"Current Stock",
		"Minimum Stock",
		"Latest Cost",
		"Total Value",
		"Unit",
		"Last Movement",
	];
	worksheet.addRow(headers);
	styleHeaderRow(worksheet, 3);

	// Add data
	for (const item of data) {
		worksheet.addRow([
			item.productName,
			item.sku,
			item.category,
			item.totalReceived,
			item.totalIssued,
			item.currentStock,
			item.minimumStock,
			item.latestCost,
			item.totalValue,
			item.unit,
			item.lastMovement
				? formatDate(item.lastMovement, "MMM DD, YYYY HH:mm")
				: "N/A",
		]);
	}

	// Format number columns
	worksheet.getColumn(4).numFmt = "#,##0";
	worksheet.getColumn(5).numFmt = "#,##0";
	worksheet.getColumn(6).numFmt = "#,##0";
	worksheet.getColumn(7).numFmt = "#,##0";
	worksheet.getColumn(8).numFmt = "$#,##0.00";
	worksheet.getColumn(9).numFmt = "$#,##0.00";

	autoFitColumns(worksheet);

	await downloadWorkbook(
		workbook,
		`Product_Report_${formatDate(new Date(), "YYYYMMDD_HHmmss")}.xlsx`,
	);
}

// ─── Expiry Report Export ────────────────────────────────────────────────────

export async function exportExpiryReportToExcel(
	data: SerializedExpiryReport[],
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Expiry Report");

	// Add title
	worksheet.mergeCells("A1:J1");
	const titleCell = worksheet.getCell("A1");
	titleCell.value = "Expiry Report";
	titleCell.font = { size: 16, bold: true };
	titleCell.alignment = { horizontal: "center", vertical: "middle" };
	worksheet.getRow(1).height = 30;

	// Add generated date
	worksheet.mergeCells("A2:J2");
	const dateCell = worksheet.getCell("A2");
	dateCell.value = `Generated: ${formatDate(new Date(), "MMM DD, YYYY HH:mm")}`;
	dateCell.alignment = { horizontal: "center" };
	dateCell.font = { italic: true };

	// Add headers
	const headers = [
		"Lot No",
		"Product Name",
		"SKU",
		"Category",
		"Expiry Date",
		"Days Until Expiry",
		"Status",
		"Remaining Qty",
		"Unit Cost",
		"Total Value",
	];
	worksheet.addRow(headers);
	styleHeaderRow(worksheet, 3);

	// Add data
	for (const item of data) {
		const row = worksheet.addRow([
			item.lotNo,
			item.productName,
			item.sku,
			item.category,
			formatDate(item.expiryDate, "MMM DD, YYYY"),
			item.daysUntilExpiry,
			item.status.toUpperCase(),
			item.remainingQty,
			item.unitCost,
			item.totalValue,
		]);

		// Color code based on status
		const statusCell = row.getCell(7);
		switch (item.status) {
			case "expired":
				statusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFE24B4A" },
				};
				statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
				break;
			case "critical":
				statusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFBA7517" },
				};
				statusCell.font = { color: { argb: "FFFFFFFF" }, bold: true };
				break;
			case "warning":
				statusCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFFC107" },
				};
				break;
		}
	}

	// Format number columns
	worksheet.getColumn(8).numFmt = "#,##0";
	worksheet.getColumn(9).numFmt = "$#,##0.00";
	worksheet.getColumn(10).numFmt = "$#,##0.00";

	autoFitColumns(worksheet);

	await downloadWorkbook(
		workbook,
		`Expiry_Report_${formatDate(new Date(), "YYYYMMDD_HHmmss")}.xlsx`,
	);
}

// ─── Stock Received Report Export ────────────────────────────────────────────

export async function exportStockReceivedReportToExcel(
	data: SerializedStockReceivedReport[],
	dateRange: { startDate: string; endDate: string },
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Stock Received");

	// Add title
	worksheet.mergeCells("A1:J1");
	const titleCell = worksheet.getCell("A1");
	titleCell.value = "Stock Received Report";
	titleCell.font = { size: 16, bold: true };
	titleCell.alignment = { horizontal: "center", vertical: "middle" };
	worksheet.getRow(1).height = 30;

	// Add date range
	worksheet.mergeCells("A2:J2");
	const dateCell = worksheet.getCell("A2");
	dateCell.value = `Period: ${formatDate(dateRange.startDate, "MMM DD, YYYY")} - ${formatDate(dateRange.endDate, "MMM DD, YYYY")}`;
	dateCell.alignment = { horizontal: "center" };
	dateCell.font = { italic: true };

	// Add headers
	const headers = [
		"Date",
		"Product Name",
		"SKU",
		"Lot No",
		"Quantity",
		"Unit Cost",
		"Total Cost",
		"Expiry Date",
		"Unit",
		"Created By",
	];
	worksheet.addRow(headers);
	styleHeaderRow(worksheet, 3);

	// Add data
	for (const item of data) {
		worksheet.addRow([
			formatDate(item.date, "MMM DD, YYYY HH:mm"),
			item.productName,
			item.sku,
			item.lotNo,
			item.quantity,
			item.unitCost,
			item.totalCost,
			item.expiryDate
				? formatDate(item.expiryDate, "MMM DD, YYYY")
				: "N/A",
			item.unit,
			item.createdByName || "System",
		]);
	}

	// Format number columns
	worksheet.getColumn(5).numFmt = "#,##0";
	worksheet.getColumn(6).numFmt = "$#,##0.00";
	worksheet.getColumn(7).numFmt = "$#,##0.00";

	autoFitColumns(worksheet);

	await downloadWorkbook(
		workbook,
		`Stock_Received_${formatDate(new Date(), "YYYYMMDD_HHmmss")}.xlsx`,
	);
}

// ─── Stock Issued Report Export ──────────────────────────────────────────────

export async function exportStockIssuedReportToExcel(
	data: SerializedStockIssuedReport[],
	dateRange: { startDate: string; endDate: string },
) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("Stock Issued");

	// Add title
	worksheet.mergeCells("A1:J1");
	const titleCell = worksheet.getCell("A1");
	titleCell.value = "Stock Issued Report";
	titleCell.font = { size: 16, bold: true };
	titleCell.alignment = { horizontal: "center", vertical: "middle" };
	worksheet.getRow(1).height = 30;

	// Add date range
	worksheet.mergeCells("A2:J2");
	const dateCell = worksheet.getCell("A2");
	dateCell.value = `Period: ${formatDate(dateRange.startDate, "MMM DD, YYYY")} - ${formatDate(dateRange.endDate, "MMM DD, YYYY")}`;
	dateCell.alignment = { horizontal: "center" };
	dateCell.font = { italic: true };

	// Add headers
	const headers = [
		"Date",
		"Product Name",
		"SKU",
		"Lot No",
		"Quantity",
		"Balance After",
		"Unit",
		"Remark",
		"Created By",
	];
	worksheet.addRow(headers);
	styleHeaderRow(worksheet, 3);

	// Add data
	for (const item of data) {
		worksheet.addRow([
			formatDate(item.date, "MMM DD, YYYY HH:mm"),
			item.productName,
			item.sku,
			item.lotNo || "N/A",
			item.quantity,
			item.balanceAfter,
			item.unit,
			item.remark || "-",
			item.createdByName || "System",
		]);
	}

	// Format number columns
	worksheet.getColumn(5).numFmt = "#,##0";
	worksheet.getColumn(6).numFmt = "#,##0";

	autoFitColumns(worksheet);

	await downloadWorkbook(
		workbook,
		`Stock_Issued_${formatDate(new Date(), "YYYYMMDD_HHmmss")}.xlsx`,
	);
}
