"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { ForbiddenError, requireRole } from "@/lib/auth-guard";
import { ROUTES } from "@/constants/routes";

import {
  createProductService,
  getProductDetailService,
} from "./service";
import type {
  ActionResult,
  CreateProductInput,
  CreateProductResult,
  ProductDetail,
} from "./types";

const PRODUCT_WRITE_ROLES = ["OWNER", "STOCK_MANAGER"] as const;

export async function getProductDetailAction(
  productId: string,
): Promise<ActionResult<ProductDetail>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Not authenticated." };
  }

  try {
    const detail = await getProductDetailService(productId);
    if (!detail) {
      return { success: false, error: "Product not found." };
    }
    return { success: true, data: detail };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load product detail.",
    };
  }
}

export async function createProductAction(
  input: CreateProductInput,
): Promise<CreateProductResult> {
  try {
    await requireRole([...PRODUCT_WRITE_ROLES]);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { success: false, error: "คุณไม่มีสิทธิ์เพิ่มสินค้า" };
    }
    throw err;
  }

  const result = await createProductService(input);
  if (result.success) {
    revalidatePath(ROUTES.DASHBOARD.PRODUCTS);
  }
  return result;
}
