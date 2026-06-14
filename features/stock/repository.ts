import "server-only";

import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, gt, ilike, or, sql } from "drizzle-orm";

import { db } from "@/app/db";
import { user } from "@/app/db/auth-schema";
import { productLots, products } from "@/app/db/product-schema";
import { stockMovements } from "@/app/db/stock-schema";
import { toDateString } from "@/lib/helper";
import { paginate } from "@/lib/query/paginate";

import type {
  CutInput,
  PendingListParams,
  PendingMovement,
  PendingMovementList,
  ProductPickerOption,
  ReceiveInput,
} from "./types";

/** Result of a review transaction against a single movement. */
export type ReviewOutcome =
  | "ok"
  | "not_found"
  | "not_pending"
  | "insufficient";

// ─── Shared balance aggregate ──────────────────────────────────────────────────

/** SUM(remaining_qty) per product, coalesced to 0. */
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

// ─── Product picker ────────────────────────────────────────────────────────────

export async function searchProductsForPicker(
  q: string,
  limit: number,
): Promise<ProductPickerOption[]> {
  const trimmed = q.trim();
  const searchCondition = trimmed
    ? or(
        ilike(products.sku, `%${trimmed}%`),
        ilike(products.name, `%${trimmed}%`),
      )
    : undefined;

  return db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      unit: products.unit,
      totalBalance: sql<number>`COALESCE(${balanceSubquery.totalBalance}, 0)::int`,
    })
    .from(products)
    .leftJoin(balanceSubquery, eq(balanceSubquery.productId, products.id))
    .where(and(eq(products.isActive, true), searchCondition))
    .orderBy(asc(products.name))
    .limit(limit);
}

export async function findProductBalance(
  productId: string,
): Promise<ProductPickerOption | null> {
  const [row] = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      unit: products.unit,
      totalBalance: sql<number>`COALESCE(${balanceSubquery.totalBalance}, 0)::int`,
    })
    .from(products)
    .leftJoin(balanceSubquery, eq(balanceSubquery.productId, products.id))
    .where(eq(products.id, productId))
    .limit(1);

  return row ?? null;
}

// ─── Submit (pending receive) ──────────────────────────────────────────────────

export async function insertPendingReceive(
  input: ReceiveInput,
  userId: string,
): Promise<string> {
  const id = randomUUID();
  await db.insert(stockMovements).values({
    id,
    productId: input.productId,
    lotId: null,
    movementType: "receive",
    status: "pending",
    quantity: input.quantity,
    balanceAfter: null,
    reqLotNo: input.lotNo,
    reqExpiryDate: input.expiryDate,
    reqUnitCost: input.unitCost,
    referenceNo: input.referenceNo,
    reason: input.reason,
    remark: input.remark,
    createdBy: userId,
  });
  return id;
}

export async function insertPendingCut(
  input: CutInput,
  userId: string,
): Promise<string> {
  const id = randomUUID();
  await db.insert(stockMovements).values({
    id,
    productId: input.productId,
    lotId: null,
    movementType: "issue",
    status: "pending",
    quantity: input.quantity,
    balanceAfter: null,
    reason: input.reason,
    referenceNo: input.referenceNo,
    remark: input.remark,
    createdBy: userId,
  });
  return id;
}

// ─── Approvals listing ─────────────────────────────────────────────────────────

export async function listPendingMovements(
  params: PendingListParams,
): Promise<PendingMovementList> {
  return paginate<PendingMovement>({
    page: params.page,
    limit: params.limit,
    listQuery: async ({ limit, offset }) => {
      const rows = await db
        .select({
          id: stockMovements.id,
          movementType: stockMovements.movementType,
          productSku: products.sku,
          productName: products.name,
          unit: products.unit,
          quantity: stockMovements.quantity,
          reqLotNo: stockMovements.reqLotNo,
          reqExpiryDate: stockMovements.reqExpiryDate,
          reason: stockMovements.reason,
          referenceNo: stockMovements.referenceNo,
          requestedByName: user.name,
          createdAt: stockMovements.createdAt,
        })
        .from(stockMovements)
        .innerJoin(products, eq(products.id, stockMovements.productId))
        .leftJoin(user, eq(user.id, stockMovements.createdBy))
        .where(eq(stockMovements.status, "pending"))
        .orderBy(desc(stockMovements.createdAt))
        .limit(limit)
        .offset(offset);

      return rows.map((row) => ({
        id: row.id,
        movementType: row.movementType,
        productSku: row.productSku,
        productName: row.productName,
        unit: row.unit,
        quantity: row.quantity,
        reqLotNo: row.reqLotNo ?? null,
        reqExpiryDate: row.reqExpiryDate ?? null,
        reason: row.reason ?? null,
        referenceNo: row.referenceNo ?? null,
        requestedByName: row.requestedByName ?? null,
        createdAt: row.createdAt.toISOString(),
      }));
    },
    countQuery: async () => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(stockMovements)
        .where(eq(stockMovements.status, "pending"));
      return value;
    },
  });
}

// ─── Approve / Reject transactions ─────────────────────────────────────────────

/**
 * Approves a pending movement and applies its stock effect in one transaction:
 * - receive → materialize a new lot,
 * - issue   → FEFO-decrement existing lots (fails if stock is insufficient).
 *
 * Recomputes the balance and stamps the review. Row-locks the movement (and, for
 * issues, the affected lots) to guard concurrent approvals.
 */
export async function approveMovementTx(
  movementId: string,
  reviewerId: string,
): Promise<ReviewOutcome> {
  return db.transaction(async (tx) => {
    const [movement] = await tx
      .select({
        status: stockMovements.status,
        movementType: stockMovements.movementType,
        productId: stockMovements.productId,
        quantity: stockMovements.quantity,
        reqLotNo: stockMovements.reqLotNo,
        reqExpiryDate: stockMovements.reqExpiryDate,
        reqUnitCost: stockMovements.reqUnitCost,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .where(eq(stockMovements.id, movementId))
      .limit(1)
      .for("update");

    if (!movement) return "not_found";
    if (movement.status !== "pending") return "not_pending";

    // lotId references the new lot for a receive; null for a (multi-lot) issue.
    let lotId: string | null = null;

    if (movement.movementType === "receive") {
      lotId = randomUUID();
      await tx.insert(productLots).values({
        id: lotId,
        productId: movement.productId,
        lotNo: movement.reqLotNo ?? "",
        expiryDate: movement.reqExpiryDate,
        receivedDate: toDateString(movement.createdAt),
        quantity: movement.quantity,
        remainingQty: movement.quantity,
        unitCost: movement.reqUnitCost,
      });
    } else if (movement.movementType === "issue") {
      // FEFO: consume earliest-expiring lots first. Lock the rows we read.
      const lots = await tx
        .select({
          id: productLots.id,
          remainingQty: productLots.remainingQty,
        })
        .from(productLots)
        .where(
          and(
            eq(productLots.productId, movement.productId),
            gt(productLots.remainingQty, 0),
          ),
        )
        .orderBy(sql`${productLots.expiryDate} ASC NULLS LAST`)
        .for("update");

      const available = lots.reduce((sum, lot) => sum + lot.remainingQty, 0);
      // Checked before any mutation, so an early return commits no changes.
      if (available < movement.quantity) return "insufficient";

      let toCut = movement.quantity;
      for (const lot of lots) {
        if (toCut <= 0) break;
        const take = Math.min(lot.remainingQty, toCut);
        await tx
          .update(productLots)
          .set({ remainingQty: lot.remainingQty - take })
          .where(eq(productLots.id, lot.id));
        toCut -= take;
      }
    }

    const [{ totalBalance }] = await tx
      .select({
        totalBalance: sql<number>`COALESCE(SUM(${productLots.remainingQty}), 0)::int`,
      })
      .from(productLots)
      .where(eq(productLots.productId, movement.productId));

    await tx
      .update(stockMovements)
      .set({
        status: "approved",
        lotId,
        balanceAfter: totalBalance,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(stockMovements.id, movementId));

    return "ok";
  });
}

/**
 * Rejects a pending movement. No lot is created; the reject reason is appended
 * to the remark so the original source/note are preserved.
 */
export async function rejectMovementTx(
  movementId: string,
  reviewerId: string,
  rejectReason: string,
): Promise<ReviewOutcome> {
  return db.transaction(async (tx) => {
    const [movement] = await tx
      .select({
        status: stockMovements.status,
        remark: stockMovements.remark,
      })
      .from(stockMovements)
      .where(eq(stockMovements.id, movementId))
      .limit(1)
      .for("update");

    if (!movement) return "not_found";
    if (movement.status !== "pending") return "not_pending";

    const rejectionNote = `Rejected: ${rejectReason}`;
    const remark = movement.remark
      ? `${movement.remark} | ${rejectionNote}`
      : rejectionNote;

    await tx
      .update(stockMovements)
      .set({
        status: "unapproved",
        remark,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      })
      .where(eq(stockMovements.id, movementId));

    return "ok";
  });
}
