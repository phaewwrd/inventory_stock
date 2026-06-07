"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { getProductDetailService } from "./service";
import type { ActionResult, ProductDetail } from "./types";

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
