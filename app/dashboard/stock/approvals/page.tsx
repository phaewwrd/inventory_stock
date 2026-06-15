import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DataTablePagination } from "@/components/data-table";
import { HeaderPage } from "@/components/header-page";
import { ApprovalsTable } from "@/components/stock/approvals-table";
import { ROUTES } from "@/constants/routes";
import { getPendingApprovalsService } from "@/features/stock/service";
import { ForbiddenError, requireRole } from "@/lib/auth-guard";
import {
	parsePagination,
	type RawSearchParams,
} from "@/lib/query/parse-search-params";

export const metadata: Metadata = {
	title: "Approvals | StockMS",
	description: "Review and approve pending stock transactions.",
};

interface ApprovalsPageProps {
	searchParams: Promise<RawSearchParams>;
}

export default async function ApprovalsPage({
	searchParams,
}: ApprovalsPageProps) {
	try {
		await requireRole(["OWNER", "STOCK_MANAGER"]);
	} catch (error) {
		if (error instanceof ForbiddenError) {
			redirect(ROUTES.DASHBOARD.HOME);
		}
		throw error;
	}

	const { page, limit } = parsePagination(await searchParams, { limit: 10 });
	const { items, total } = await getPendingApprovalsService({ page, limit });

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<HeaderPage
				title="Approval queue"
				description={`${total.toLocaleString()} transactions pending review`}
				showDashboardBtn={false}
			/>

			<Card>
				<CardContent sx={{ p: 0 }}>
					<ApprovalsTable items={items} />
					<DataTablePagination page={page} limit={limit} total={total} />
				</CardContent>
			</Card>
		</main>
	);
}
