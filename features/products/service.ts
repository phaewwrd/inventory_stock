import "server-only";

import {
  computeStatus,
  findLotsByProductId,
  findProductById,
  findRecentMovements,
  listProducts,
} from "./repository";
import type {
  ProductDetail,
  ProductListParams,
  ProductListResult,
} from "./types";

const RECENT_MOVEMENTS_LIMIT = 10;

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getProductListService(
  params: ProductListParams,
): Promise<ProductListResult> {
  return listProducts(params);
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getProductDetailService(
  productId: string,
): Promise<ProductDetail | null> {
  const product = await findProductById(productId);
  if (!product) return null;

  const [lots, recentMovements] = await Promise.all([
    findLotsByProductId(productId),
    findRecentMovements(productId, RECENT_MOVEMENTS_LIMIT),
  ]);

  const totalBalance = lots.reduce((sum, lot) => sum + lot.remainingQty, 0);

  const fefoLot = lots.find((lot) => lot.remainingQty > 0) ?? null;

  const status = computeStatus({
    totalBalance,
    minimumStock: product.minimumStock,
    representativeExpiry: fefoLot?.expiryDate ?? null,
  });

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    unit: product.unit,
    size: product.size,
    categoryName: product.categoryName,
    minimumStock: product.minimumStock,
    latestCost: product.latestCost,
    note: product.note,
    isActive: product.isActive,
    totalBalance,
    status,
    lots,
    recentMovements,
  };
}
