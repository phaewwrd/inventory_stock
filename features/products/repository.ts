import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/app/db";
import { user } from "@/app/db/auth-schema";
import {
  categories,
  productLots,
  products,
} from "@/app/db/product-schema";
import { stockMovements } from "@/app/db/stock-schema";
import { toDateString } from "@/lib/helper";
import { paginate } from "@/lib/query/paginate";

import { NEAR_EXPIRY_DAYS } from "./types";
import type {
  ProductListItem,
  ProductListParams,
  ProductListResult,
  ProductLotRow,
  ProductMovementRow,
  ProductStatus,
} from "./types";

// ─── Aggregated subqueries ───────────────────────────────────────────────────

/** SUM(remaining_qty) per product. Coalesced to 0 when product has no lots. */
const balanceSubquery = db
  .select({
    productId: productLots.productId,
    totalBalance:
      sql<number>`COALESCE(SUM(${productLots.remainingQty}), 0)::int`.as(
        "total_balance",
      ),
  })
  .from(productLots)
  .groupBy(productLots.productId)
  .as("balance_agg");

/**
 * FEFO lot per product: earliest expiry where remaining > 0.
 * Lots with NULL expiry sort last so they're picked only as fallback.
 */
const fefoLotSubquery = db
  .selectDistinctOn([productLots.productId], {
    productId: productLots.productId,
    lotNo: productLots.lotNo,
    expiryDate: productLots.expiryDate,
  })
  .from(productLots)
  .where(gt(productLots.remainingQty, 0))
  .orderBy(
    productLots.productId,
    sql`${productLots.expiryDate} ASC NULLS LAST`,
  )
  .as("fefo_lot");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayDateString(): string {
  return toDateString(new Date());
}

function nearExpiryCutoff(): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + NEAR_EXPIRY_DAYS);
  return toDateString(cutoff);
}

function buildSearchCondition(q: string) {
  if (!q.trim()) return undefined;
  const pattern = `%${q.trim()}%`;
  const lotMatchProductIds = db
    .selectDistinct({ productId: productLots.productId })
    .from(productLots)
    .where(ilike(productLots.lotNo, pattern));
  return or(
    ilike(products.sku, pattern),
    ilike(products.name, pattern),
    inArray(products.id, lotMatchProductIds),
  );
}

function buildStatusCondition(status: ProductListParams["status"]) {
  if (status === "all") return undefined;

  const balance = balanceSubquery.totalBalance;
  const expiry = fefoLotSubquery.expiryDate;
  const today = todayDateString();
  const nearCutoff = nearExpiryCutoff();

  switch (status) {
    case "out_of_stock":
      return eq(sql`COALESCE(${balance}, 0)`, 0);

    case "expired":
      return and(
        gt(sql`COALESCE(${balance}, 0)`, 0),
        isNotNull(expiry),
        lte(expiry, today),
      );

    case "low_stock":
      return and(
        gt(sql`COALESCE(${balance}, 0)`, 0),
        lte(sql`COALESCE(${balance}, 0)`, products.minimumStock),
        // not expired
        or(isNull(expiry), gt(expiry, today)),
      );

    case "near_expiry":
      return and(
        gt(sql`COALESCE(${balance}, 0)`, 0),
        gt(sql`COALESCE(${balance}, 0)`, products.minimumStock),
        isNotNull(expiry),
        gt(expiry, today),
        lte(expiry, nearCutoff),
      );

    case "active":
      return and(
        gt(sql`COALESCE(${balance}, 0)`, 0),
        gt(sql`COALESCE(${balance}, 0)`, products.minimumStock),
        or(isNull(expiry), gt(expiry, nearCutoff)),
      );

    default:
      return undefined;
  }
}

function buildOrderBy(
  sort: ProductListParams["sort"],
  dir: ProductListParams["dir"],
) {
  const direction = dir === "desc" ? desc : asc;
  switch (sort) {
    case "code":
      return direction(products.sku);
    case "expire":
      // NULL expiries sort last regardless of direction
      return sql`${fefoLotSubquery.expiryDate} ${sql.raw(dir.toUpperCase())} NULLS LAST`;
    case "balance":
      return direction(sql`COALESCE(${balanceSubquery.totalBalance}, 0)`);
    case "name":
    default:
      return direction(products.name);
  }
}

function mapStatusFromRow(row: {
  totalBalance: number;
  minimumStock: number;
  expiryDate: string | null;
  today: string;
  nearCutoff: string;
}): ProductStatus {
  if (row.totalBalance <= 0) return "out_of_stock";
  if (row.expiryDate && row.expiryDate <= row.today) return "expired";
  if (row.totalBalance <= row.minimumStock) return "low_stock";
  if (
    row.expiryDate &&
    row.expiryDate > row.today &&
    row.expiryDate <= row.nearCutoff
  ) {
    return "near_expiry";
  }
  return "active";
}

// ─── List query ──────────────────────────────────────────────────────────────

export async function listProducts(
  params: ProductListParams,
): Promise<ProductListResult> {
  const today = todayDateString();
  const nearCutoff = nearExpiryCutoff();

  const searchCondition = buildSearchCondition(params.q);
  const statusCondition = buildStatusCondition(params.status);
  const whereCondition = and(searchCondition, statusCondition);

  return paginate<ProductListItem>({
    page: params.page,
    limit: params.limit,
    listQuery: async ({ limit, offset }) => {
      const rows = await db
        .select({
          id: products.id,
          sku: products.sku,
          name: products.name,
          unit: products.unit,
          size: products.size,
          minimumStock: products.minimumStock,
          totalBalance: sql<number>`COALESCE(${balanceSubquery.totalBalance}, 0)::int`,
          lotNo: fefoLotSubquery.lotNo,
          expiryDate: fefoLotSubquery.expiryDate,
        })
        .from(products)
        .leftJoin(balanceSubquery, eq(balanceSubquery.productId, products.id))
        .leftJoin(fefoLotSubquery, eq(fefoLotSubquery.productId, products.id))
        .where(whereCondition)
        .orderBy(buildOrderBy(params.sort, params.dir))
        .limit(limit)
        .offset(offset);

      return rows.map((row) => ({
        id: row.id,
        sku: row.sku,
        name: row.name,
        unit: row.unit,
        size: row.size,
        minimumStock: row.minimumStock,
        totalBalance: row.totalBalance,
        representativeLot: row.lotNo
          ? { lotNo: row.lotNo, expiryDate: row.expiryDate ?? null }
          : null,
        status: mapStatusFromRow({
          totalBalance: row.totalBalance,
          minimumStock: row.minimumStock,
          expiryDate: row.expiryDate ?? null,
          today,
          nearCutoff,
        }),
      }));
    },
    countQuery: async () => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(products)
        .leftJoin(balanceSubquery, eq(balanceSubquery.productId, products.id))
        .leftJoin(fefoLotSubquery, eq(fefoLotSubquery.productId, products.id))
        .where(whereCondition);
      return value;
    },
  });
}

// ─── Detail queries ──────────────────────────────────────────────────────────

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

export async function findProductById(
  id: string,
): Promise<ProductRecord | null> {
  const [row] = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      unit: products.unit,
      size: products.size,
      categoryName: categories.productname,
      minimumStock: products.minimumStock,
      latestCost: products.latestCost,
      note: products.note,
      isActive: products.isActive,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id))
    .limit(1);

  return row ?? null;
}

export async function findLotsByProductId(
  productId: string,
): Promise<ProductLotRow[]> {
  const rows = await db
    .select({
      id: productLots.id,
      lotNo: productLots.lotNo,
      expiryDate: productLots.expiryDate,
      receivedDate: productLots.receivedDate,
      quantity: productLots.quantity,
      remainingQty: productLots.remainingQty,
      unitCost: productLots.unitCost,
    })
    .from(productLots)
    .where(eq(productLots.productId, productId))
    .orderBy(sql`${productLots.expiryDate} ASC NULLS LAST`);

  return rows.map((row) => ({
    id: row.id,
    lotNo: row.lotNo,
    expiryDate: row.expiryDate ?? null,
    receivedDate: row.receivedDate,
    quantity: row.quantity,
    remainingQty: row.remainingQty,
    unitCost: row.unitCost ?? null,
  }));
}

export async function findRecentMovements(
  productId: string,
  limit: number,
): Promise<ProductMovementRow[]> {
  const rows = await db
    .select({
      id: stockMovements.id,
      movementType: stockMovements.movementType,
      quantity: stockMovements.quantity,
      balanceAfter: stockMovements.balanceAfter,
      lotNo: productLots.lotNo,
      remark: stockMovements.remark,
      createdByName: user.name,
      createdAt: stockMovements.createdAt,
    })
    .from(stockMovements)
    .leftJoin(productLots, eq(productLots.id, stockMovements.lotId))
    .leftJoin(user, eq(user.id, stockMovements.createdBy))
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    movementType: row.movementType,
    quantity: row.quantity,
    balanceAfter: row.balanceAfter,
    lotNo: row.lotNo ?? null,
    remark: row.remark ?? null,
    createdByName: row.createdByName ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

// ─── Status helper exposed for service consumers ────────────────────────────

export function computeStatus(args: {
  totalBalance: number;
  minimumStock: number;
  representativeExpiry: string | null;
}): ProductStatus {
  return mapStatusFromRow({
    totalBalance: args.totalBalance,
    minimumStock: args.minimumStock,
    expiryDate: args.representativeExpiry,
    today: todayDateString(),
    nearCutoff: nearExpiryCutoff(),
  });
}
