import { and, between, eq, gte, sql } from "drizzle-orm";
import { db } from "@/app/db";
import {
	categories,
	productLots,
	products,
	stockMovements,
	user,
} from "@/app/db/schema";
import type {
	ExpiryReport,
	ProductReport,
	StockIssuedReport,
	StockReceivedReport,
} from "./types";

// ─── Product Report Queries ──────────────────────────────────────────────────

export async function getProductReportData(
  startDate: Date,
  endDate: Date,
): Promise<ProductReport[]> {
  const lotSummary = db
    .select({
      productId: productLots.productId,
      currentStock: sql<number>`
        COALESCE(SUM(${productLots.remainingQty}), 0)
      `.as("current_stock"),
    })
    .from(productLots)
    .groupBy(productLots.productId)
    .as("lot_summary");

  const movementSummary = db
    .select({
      productId: stockMovements.productId,

      totalReceived: sql<number>`
        COALESCE(
          SUM(
            CASE
              WHEN ${stockMovements.movementType} = 'receive'
              THEN ${stockMovements.quantity}
              ELSE 0
            END
          ),
          0
        )
      `.as("total_received"),

      totalIssued: sql<number>`
        COALESCE(
          SUM(
            CASE
              WHEN ${stockMovements.movementType} = 'issue'
              THEN ${stockMovements.quantity}
              ELSE 0
            END
          ),
          0
        )
      `.as("total_issued"),

      lastMovement: sql<Date | null>`
        MAX(${stockMovements.createdAt})
      `.as("last_movement"),
    })
    .from(stockMovements)
    .where(
			between(stockMovements.createdAt, startDate, endDate),
    )
    .groupBy(stockMovements.productId)
    .as("movement_summary");

  const result = await db
    .select({
      productId: products.id,
      productName: products.name,
      sku: products.sku,
      category: categories.productname,

			totalReceived: movementSummary.totalReceived,

			totalIssued: movementSummary.totalIssued,

			currentStock: lotSummary.currentStock,

      minimumStock: products.minimumStock,
      latestCost: products.latestCost,

      totalValue: sql<number>`
        COALESCE(${lotSummary.currentStock}, 0)
        * COALESCE(${products.latestCost}, 0)
      `,

      unit: products.unit,

      lastMovement: movementSummary.lastMovement,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      lotSummary,
      eq(products.id, lotSummary.productId),
    )
    .leftJoin(
      movementSummary,
      eq(products.id, movementSummary.productId),
    )
    .where(eq(products.isActive, true));

  return result.map((row) => ({
		productId: row.productId,
		productName: row.productName,
		sku: row.sku,
		category: row.category ?? "Uncategorized",
		totalReceived: Number(row.totalReceived ?? 0),
		totalIssued: Number(row.totalIssued ?? 0),
		currentStock: Number(row.currentStock ?? 0),
		minimumStock: Number(row.minimumStock ?? 0),
		latestCost: Number(row.latestCost ?? 0),
		totalValue: Number(row.totalValue ?? 0),
		unit: row.unit,
		lastMovement: row.lastMovement
			? new Date(row.lastMovement)
			: null,
  }));
}

// ─── Expiry Report Queries ───────────────────────────────────────────────────

export async function getExpiryReportData(): Promise<ExpiryReport[]> {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const result = await db
		.select({
			lotId: productLots.id,
			lotNo: productLots.lotNo,
			productId: products.id,
			productName: products.name,
			sku: products.sku,
			category: categories.productname,
			expiryDate: productLots.expiryDate,
			remainingQty: productLots.remainingQty,
			unitCost: productLots.unitCost,
			unit: products.unit,
		})
		.from(productLots)
		.innerJoin(products, eq(productLots.productId, products.id))
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.where(and(eq(products.isActive, true), gte(productLots.remainingQty, 1)));

	return result
		.filter((row) => row.expiryDate != null)
		.map((row) => {
			const expiryDate = new Date(row.expiryDate as string);
			const daysUntilExpiry = Math.ceil(
				(expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);

			let status: "expired" | "critical" | "warning" | "normal";
			if (daysUntilExpiry < 0) {
				status = "expired";
			} else if (daysUntilExpiry <= 30) {
				status = "critical";
			} else if (daysUntilExpiry <= 90) {
				status = "warning";
			} else {
				status = "normal";
			}

			const unitCost = row.unitCost ? Number(row.unitCost) : 0;
			const totalValue = row.remainingQty * unitCost;

			return {
				lotId: row.lotId,
				lotNo: row.lotNo,
				productId: row.productId,
				productName: row.productName,
				sku: row.sku,
				category: row.category || "Uncategorized",
				expiryDate,
				remainingQty: row.remainingQty,
				unitCost,
				totalValue,
				unit: row.unit,
				daysUntilExpiry,
				status,
			};
		});
}

// ─── Stock Received Report Queries ───────────────────────────────────────────

export async function getStockReceivedReportData(
	startDate: Date,
	endDate: Date,
): Promise<StockReceivedReport[]> {
	const result = await db
		.select({
			id: stockMovements.id,
			date: stockMovements.createdAt,
			productId: products.id,
			productName: products.name,
			sku: products.sku,
			lotNo: productLots.lotNo,
			quantity: stockMovements.quantity,
			unitCost: productLots.unitCost,
			unit: products.unit,
			expiryDate: productLots.expiryDate,
			createdBy: stockMovements.createdBy,
			createdByName: user.name,
		})
		.from(stockMovements)
		.innerJoin(products, eq(stockMovements.productId, products.id))
		.leftJoin(productLots, eq(stockMovements.lotId, productLots.id))
		.leftJoin(user, eq(stockMovements.createdBy, user.id))
		.where(
			and(
				eq(stockMovements.movementType, "receive"),
				between(stockMovements.createdAt, startDate, endDate),
			),
		)
		.orderBy(sql`${stockMovements.createdAt} DESC`);

	return result.map((row) => {
		const unitCost = row.unitCost ? Number(row.unitCost) : 0;
		return {
			id: row.id,
			date: row.date,
			productId: row.productId,
			productName: row.productName,
			sku: row.sku,
			lotNo: row.lotNo || "N/A",
			quantity: row.quantity,
			unitCost,
			totalCost: row.quantity * unitCost,
			unit: row.unit,
			expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
			createdBy: row.createdBy,
			createdByName: row.createdByName,
		};
	});
}

// ─── Stock Issued Report Queries ─────────────────────────────────────────────

export async function getStockIssuedReportData(
	startDate: Date,
	endDate: Date,
): Promise<StockIssuedReport[]> {
	const result = await db
		.select({
			id: stockMovements.id,
			date: stockMovements.createdAt,
			productId: products.id,
			productName: products.name,
			sku: products.sku,
			lotNo: productLots.lotNo,
			quantity: stockMovements.quantity,
			balanceAfter: stockMovements.balanceAfter,
			unit: products.unit,
			remark: stockMovements.remark,
			createdBy: stockMovements.createdBy,
			createdByName: user.name,
		})
		.from(stockMovements)
		.innerJoin(products, eq(stockMovements.productId, products.id))
		.leftJoin(productLots, eq(stockMovements.lotId, productLots.id))
		.leftJoin(user, eq(stockMovements.createdBy, user.id))
		.where(
			and(
				eq(stockMovements.movementType, "issue"),
				between(stockMovements.createdAt, startDate, endDate),
			),
		)
		.orderBy(sql`${stockMovements.createdAt} DESC`);

	return result.map((row) => ({
		id: row.id,
		date: row.date,
		productId: row.productId,
		productName: row.productName,
		sku: row.sku,
		lotNo: row.lotNo,
		quantity: row.quantity,
		balanceAfter: row.balanceAfter,
		unit: row.unit,
		remark: row.remark,
		createdBy: row.createdBy,
		createdByName: row.createdByName,
	}));
}

// ─── Summary Queries ─────────────────────────────────────────────────────────

export async function getCategoryBreakdown() {
	const result = await db
		.select({
			category: categories.productname,
			count: sql<number>`COUNT(DISTINCT ${products.id})`,
			value: sql<number>`
        COALESCE(
          SUM(${productLots.remainingQty} * COALESCE(${products.latestCost}, 0)),
          0
        )
      `,
		})
		.from(products)
		.leftJoin(categories, eq(products.categoryId, categories.id))
		.leftJoin(productLots, eq(products.id, productLots.productId))
		.where(eq(products.isActive, true))
		.groupBy(categories.productname);

	return result.map((row) => ({
		category: row.category || "Uncategorized",
		count: Number(row.count),
		value: Number(row.value),
	}));
}

export async function getTopProducts(
	startDate: Date,
	endDate: Date,
	movementType: "receive" | "issue",
	limit = 10,
) {
	const result = await db
		.select({
			productName: products.name,
			quantity: sql<number>`SUM(${stockMovements.quantity})`,
			value: sql<number>`
        SUM(${stockMovements.quantity} * COALESCE(${products.latestCost}, 0))
      `,
		})
		.from(stockMovements)
		.innerJoin(products, eq(stockMovements.productId, products.id))
		.where(
			and(
				eq(stockMovements.movementType, movementType),
				between(stockMovements.createdAt, startDate, endDate),
			),
		)
		.groupBy(products.name)
		.orderBy(sql`SUM(${stockMovements.quantity}) DESC`)
		.limit(limit);

	return result.map((row) => ({
		productName: row.productName,
		quantity: Number(row.quantity),
		value: Number(row.value),
	}));
}

export async function getTimeSeriesData(startDate: Date, endDate: Date) {
	const result = await db
		.select({
			date: sql<string>`DATE(${stockMovements.createdAt})`,
			received: sql<number>`
        COALESCE(SUM(
          CASE WHEN ${stockMovements.movementType} = 'receive' 
          THEN ${stockMovements.quantity} 
          ELSE 0 END
        ), 0)
      `,
			issued: sql<number>`
        COALESCE(SUM(
          CASE WHEN ${stockMovements.movementType} = 'issue' 
          THEN ${stockMovements.quantity} 
          ELSE 0 END
        ), 0)
      `,
		})
		.from(stockMovements)
		.where(between(stockMovements.createdAt, startDate, endDate))
		.groupBy(sql`DATE(${stockMovements.createdAt})`)
		.orderBy(sql`DATE(${stockMovements.createdAt}) ASC`);

	let balance = 0;
	return result.map((row) => {
		balance += Number(row.received) - Number(row.issued);
		return {
			date: row.date,
			received: Number(row.received),
			issued: Number(row.issued),
			balance,
		};
	});
}
