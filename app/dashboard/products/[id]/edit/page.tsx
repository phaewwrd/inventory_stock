import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { HeaderPage } from "@/components/header-page";
import { ProductForm } from "@/components/products/product-form";
import { ROUTES } from "@/constants/routes";
import {
	getCategoryOptionsService,
	getProductRecordService,
} from "@/features/products/service";
import { ForbiddenError, requireRole } from "@/lib/auth-guard";

export const metadata: Metadata = {
	title: "Edit product | StockMS",
	description: "Edit an existing product in the catalog.",
};

interface EditProductPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditProductPage({
	params,
}: EditProductPageProps) {
	try {
		await requireRole(["OWNER", "STOCK_MANAGER"]);
	} catch (error) {
		if (error instanceof ForbiddenError) {
			redirect(ROUTES.DASHBOARD.PRODUCTS);
		}
		throw error;
	}

	const { id } = await params;
	const [product, categories] = await Promise.all([
		getProductRecordService(id),
		getCategoryOptionsService(),
	]);
	if (!product) notFound();

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<HeaderPage
				title="Edit product"
				description={`Update ${product.sku}`}
				showDashboardBtn={false}
			/>

			<ProductForm
				categories={categories}
				productId={product.id}
				initial={{
					sku: product.sku,
					name: product.name,
					categoryId: product.categoryId,
					unit: product.unit,
					minimumStock: String(product.minimumStock),
					size: product.size ?? "",
					latestCost: product.latestCost ?? "",
					note: product.note ?? "",
					isActive: product.isActive,
				}}
			/>
		</main>
	);
}
