"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { ForbiddenError, requireRole } from "@/lib/auth-guard";

import { searchProductsForPicker } from "./repository";
import {
  approveMovementService,
  rejectMovementService,
  submitReceiveService,
} from "./service";
import type {
  ProductPickerOption,
  ReceiveInput,
  StockActionResult,
} from "./types";

const ALL_ROLES = ["OWNER", "STOCK_MANAGER", "STOCK_USER"] as const;
const REVIEW_ROLES = ["OWNER", "STOCK_MANAGER"] as const;
const PRODUCT_PICKER_LIMIT = 20;

// ─── Product picker search (any logged-in user) ────────────────────────────────

export async function searchProductsAction(
  query: string,
): Promise<ProductPickerOption[]> {
  try {
    await requireRole([...ALL_ROLES]);
  } catch {
    return [];
  }
  return searchProductsForPicker(query, PRODUCT_PICKER_LIMIT);
}

// ─── Submit receive (any logged-in user) ───────────────────────────────────────

export async function submitReceiveAction(
  input: ReceiveInput,
): Promise<StockActionResult<{ movementId: string }>> {
  let userId: string;
  try {
    const session = await requireRole([...ALL_ROLES]);
    userId = session.user.id;
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: "คุณไม่มีสิทธิ์ทำรายการนี้" };
    }
    throw err;
  }

  const result = await submitReceiveService(input, userId);
  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.STOCK.APPROVALS);
  }
  return result;
}

// ─── Approve / Reject (OWNER + STOCK_MANAGER) ──────────────────────────────────

export async function approveMovementAction(
  movementId: string,
): Promise<StockActionResult> {
  let reviewerId: string;
  try {
    const session = await requireRole([...REVIEW_ROLES]);
    reviewerId = session.user.id;
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: "คุณไม่มีสิทธิ์อนุมัติ" };
    }
    throw err;
  }

  const result = await approveMovementService(movementId, reviewerId);
  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.STOCK.APPROVALS);
    revalidatePath(ROUTES.DASHBOARD.PRODUCTS);
  }
  return result;
}

export async function rejectMovementAction(
  movementId: string,
  rejectReason: string,
): Promise<StockActionResult> {
  let reviewerId: string;
  try {
    const session = await requireRole([...REVIEW_ROLES]);
    reviewerId = session.user.id;
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: "คุณไม่มีสิทธิ์ปฏิเสธรายการ" };
    }
    throw err;
  }

  const result = await rejectMovementService(
    movementId,
    reviewerId,
    rejectReason,
  );
  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.STOCK.APPROVALS);
  }
  return result;
}
