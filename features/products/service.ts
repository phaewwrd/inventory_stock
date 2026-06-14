import "server-only";

import {
  computeStatus,
  findAllCategories,
  findLotsByProductId,
  findProductById,
  findRecentMovements,
  generateNextSku,
  insertProduct,
  listProducts,
} from "./repository";
import type {
  CategoryOption,
  CreateProductInput,
  CreateProductResult,
  ProductDetail,
  ProductFormField,
  ProductListParams,
  ProductListResult,
} from "./types";

const RECENT_MOVEMENTS_LIMIT = 10;
const DUPLICATE_SKU_ERROR = "SKU นี้มีอยู่แล้ว กรุณาใช้รหัสอื่น";
const POSTGRES_UNIQUE_VIOLATION = "23505";

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getProductListService(
  params: ProductListParams,
): Promise<ProductListResult> {
  return listProducts(params);
}

// ─── Category options ─────────────────────────────────────────────────────────

export async function getCategoryOptionsService(): Promise<CategoryOption[]> {
  return findAllCategories();
}

// ─── Create ───────────────────────────────────────────────────────────────────

interface FieldError {
  field: ProductFormField;
  error: string;
}

/** Server-authoritative validation. Returns the first violation, or null. */
function validateCreateProductInput(input: CreateProductInput): FieldError | null {
  if (!input.name.trim()) {
    return { field: "name", error: "กรุณากรอกชื่อสินค้า" };
  }
  if (!input.categoryId.trim()) {
    return { field: "categoryId", error: "กรุณาเลือกหมวดหมู่" };
  }
  if (!input.unit.trim()) {
    return { field: "unit", error: "กรุณากรอกหน่วยนับ" };
  }
  if (!Number.isInteger(input.minimumStock) || input.minimumStock < 0) {
    return {
      field: "minimumStock",
      error: "จุดสั่งซื้อต้องเป็นจำนวนเต็มไม่ติดลบ",
    };
  }
  if (input.latestCost !== null) {
    const cost = Number(input.latestCost);
    if (Number.isNaN(cost) || cost < 0) {
      return { field: "latestCost", error: "ราคาทุนต้องเป็นตัวเลขไม่ติดลบ" };
    }
  }
  return null;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION
  );
}

export async function createProductService(
  input: CreateProductInput,
): Promise<CreateProductResult> {
  const violation = validateCreateProductInput(input);
  if (violation) {
    return { success: false, error: violation.error, field: violation.field };
  }

  const userProvidedSku = input.sku.trim();
  const baseRow = {
    categoryId: input.categoryId,
    name: input.name.trim(),
    unit: input.unit.trim(),
    size: input.size,
    latestCost: input.latestCost,
    minimumStock: input.minimumStock,
    isActive: input.isActive,
    note: input.note,
  };

  // One attempt for a user-supplied SKU; two for auto-generated, to absorb the
  // rare race where two creators land on the same next number concurrently.
  const maxAttempts = userProvidedSku ? 1 : 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const sku = userProvidedSku || (await generateNextSku());
    try {
      const id = await insertProduct({ sku, ...baseRow });
      const created = await findProductById(id);
      if (!created) {
        return { success: false, error: "สร้างสินค้าไม่สำเร็จ" };
      }
      return { success: true, data: created };
    } catch (err) {
      if (!isUniqueViolation(err)) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "สร้างสินค้าไม่สำเร็จ",
        };
      }
      const isLastAttempt = attempt === maxAttempts - 1;
      if (userProvidedSku || isLastAttempt) {
        return { success: false, error: DUPLICATE_SKU_ERROR, field: "sku" };
      }
      // auto-generated SKU collided → loop and regenerate
    }
  }

  return { success: false, error: DUPLICATE_SKU_ERROR, field: "sku" };
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
