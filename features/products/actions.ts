"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/lib/auth";
import { ForbiddenError, requireRole } from "@/lib/auth-guard";

import {
	createProductService,
	deleteProductService,
	getProductDetailService,
	updateProductService,
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

export async function updateProductAction(
	id: string,
	input: CreateProductInput,
): Promise<CreateProductResult> {
	try {
		await requireRole([...PRODUCT_WRITE_ROLES]);
	} catch (err) {
		if (err instanceof ForbiddenError) {
			return { success: false, error: "คุณไม่มีสิทธิ์แก้ไขสินค้า" };
		}
		throw err;
	}

	const result = await updateProductService(id, input);
	if (result.success) {
		revalidatePath(ROUTES.DASHBOARD.PRODUCTS);
	}
	return result;
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
	try {
		await requireRole([...PRODUCT_WRITE_ROLES]);
	} catch (err) {
		if (err instanceof ForbiddenError) {
			return { success: false, error: "คุณไม่มีสิทธิ์ลบสินค้า" };
		}
		throw err;
	}

	const result = await deleteProductService(id);
	if (result.success) {
		revalidatePath(ROUTES.DASHBOARD.PRODUCTS);
	}
	return result;
}
