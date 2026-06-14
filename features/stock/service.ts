import "server-only";

import {
  approveMovementTx,
  findProductBalance,
  insertPendingCut,
  insertPendingReceive,
  listPendingMovements,
  rejectMovementTx,
  type ReviewOutcome,
} from "./repository";
import type {
  CutInput,
  PendingListParams,
  PendingMovementList,
  ProductPickerOption,
  ReceiveFormField,
  ReceiveInput,
  StockActionResult,
} from "./types";

// ─── Receive form prefill ──────────────────────────────────────────────────────

export async function getProductForPickerService(
  productId: string,
): Promise<ProductPickerOption | null> {
  return findProductBalance(productId);
}

// ─── Submit receive ────────────────────────────────────────────────────────────

interface FieldError {
  field: ReceiveFormField;
  error: string;
}

function validateReceiveInput(input: ReceiveInput): FieldError | null {
  if (!input.productId) {
    return { field: "productId", error: "กรุณาเลือกสินค้า" };
  }
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return { field: "quantity", error: "จำนวนต้องเป็นจำนวนเต็มมากกว่า 0" };
  }
  if (!input.lotNo.trim()) {
    return { field: "lotNo", error: "กรุณากรอก Lot / Batch" };
  }
  if (input.unitCost !== null) {
    const cost = Number(input.unitCost);
    if (Number.isNaN(cost) || cost < 0) {
      return { field: "unitCost", error: "ราคาทุนต้องเป็นตัวเลขไม่ติดลบ" };
    }
  }
  return null;
}

export async function submitReceiveService(
  input: ReceiveInput,
  userId: string,
): Promise<StockActionResult<{ movementId: string }>> {
  const violation = validateReceiveInput(input);
  if (violation) {
    return { success: false, error: violation.error, field: violation.field };
  }

  try {
    const movementId = await insertPendingReceive(
      { ...input, lotNo: input.lotNo.trim() },
      userId,
    );
    return { success: true, data: { movementId } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ส่งคำขอไม่สำเร็จ",
    };
  }
}

// ─── Submit cut ────────────────────────────────────────────────────────────────

export async function submitCutService(
  input: CutInput,
  userId: string,
): Promise<StockActionResult<{ movementId: string }>> {
  if (!input.productId) {
    return { success: false, error: "กรุณาเลือกสินค้า", field: "productId" };
  }
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return {
      success: false,
      error: "จำนวนต้องเป็นจำนวนเต็มมากกว่า 0",
      field: "quantity",
    };
  }

  // Soft check at submit time; approval re-validates authoritatively.
  const product = await findProductBalance(input.productId);
  if (!product) {
    return { success: false, error: "ไม่พบสินค้า", field: "productId" };
  }
  if (input.quantity > product.totalBalance) {
    return {
      success: false,
      error: `สต็อกไม่พอ คงเหลือ ${product.totalBalance.toLocaleString()}`,
      field: "quantity",
    };
  }

  try {
    const movementId = await insertPendingCut(input, userId);
    return { success: true, data: { movementId } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ส่งคำขอไม่สำเร็จ",
    };
  }
}

// ─── Approvals ─────────────────────────────────────────────────────────────────

export async function getPendingApprovalsService(
  params: PendingListParams,
): Promise<PendingMovementList> {
  return listPendingMovements(params);
}

function outcomeToResult(outcome: ReviewOutcome): StockActionResult {
  switch (outcome) {
    case "ok":
      return { success: true, data: undefined };
    case "not_found":
      return { success: false, error: "ไม่พบรายการนี้" };
    case "not_pending":
      return { success: false, error: "รายการนี้ถูกดำเนินการไปแล้ว" };
    case "insufficient":
      return { success: false, error: "สต็อกไม่พอสำหรับการตัดจำนวนนี้" };
  }
}

export async function approveMovementService(
  movementId: string,
  reviewerId: string,
): Promise<StockActionResult> {
  try {
    const outcome = await approveMovementTx(movementId, reviewerId);
    return outcomeToResult(outcome);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "อนุมัติไม่สำเร็จ",
    };
  }
}

export async function rejectMovementService(
  movementId: string,
  reviewerId: string,
  rejectReason: string,
): Promise<StockActionResult> {
  if (!rejectReason.trim()) {
    return { success: false, error: "กรุณาระบุเหตุผลในการปฏิเสธ" };
  }

  try {
    const outcome = await rejectMovementTx(
      movementId,
      reviewerId,
      rejectReason.trim(),
    );
    return outcomeToResult(outcome);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ปฏิเสธไม่สำเร็จ",
    };
  }
}
