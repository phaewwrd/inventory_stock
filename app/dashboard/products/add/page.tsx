import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { HeaderPage } from "@/components/header-page";
import { ProductForm } from "@/components/products/product-form";
import { ROUTES } from "@/constants/routes";
import { getCategoryOptionsService } from "@/features/products/service";
import { ForbiddenError, requireRole } from "@/lib/auth-guard";

export const metadata: Metadata = {
	title: "Add product | StockMS",
	description: "Create a new product in the catalog.",
};

export default async function AddProductPage() {
	try {
		await requireRole(["OWNER", "STOCK_MANAGER"]);
	} catch (error) {
		if (error instanceof ForbiddenError) {
			redirect(ROUTES.DASHBOARD.PRODUCTS);
		}
		throw error;
	}

	const categories = await getCategoryOptionsService();

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<HeaderPage
				title="Add product"
				description="Create a new product in the catalog"
				showDashboardBtn={false}
			/>

			<ProductForm categories={categories} />
		</main>
	);
}
