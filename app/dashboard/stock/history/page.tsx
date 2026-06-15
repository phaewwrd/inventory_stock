import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DataTablePagination } from "@/components/data-table";
import { HeaderPage } from "@/components/header-page";
import { MovementLogTable } from "@/components/stock/movement-log-table";
import { MovementLogToolbar } from "@/components/stock/movement-log-toolbar";
import { ROUTES } from "@/constants/routes";
import { getMovementLogService } from "@/features/stock/service";
import {
	MOVEMENT_STATUS_FILTERS,
	MOVEMENT_TYPE_FILTERS,
	type MovementLogParams,
} from "@/features/stock/types";
import { auth } from "@/lib/auth";
import {
	parseEnumParam,
	parsePagination,
	parseSearchText,
	type RawSearchParams,
} from "@/lib/query/parse-search-params";

export const metadata: Metadata = {
	title: "Movement Log | StockMS",
	description: "All stock movements across the warehouse.",
};

function parseMovementLogParams(raw: RawSearchParams): MovementLogParams {
	const { page, limit } = parsePagination(raw, { limit: 15 });
	return {
		q: parseSearchText(raw),
		type: parseEnumParam(raw, "type", {
			allowedValues: MOVEMENT_TYPE_FILTERS,
			defaultValue: "all",
		}),
		status: parseEnumParam(raw, "status", {
			allowedValues: MOVEMENT_STATUS_FILTERS,
			defaultValue: "all",
		}),
		page,
		limit,
	};
}

interface MovementLogPageProps {
	searchParams: Promise<RawSearchParams>;
}

export default async function MovementLogPage({
	searchParams,
}: MovementLogPageProps) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		redirect(ROUTES.LOGIN);
	}

	const params = parseMovementLogParams(await searchParams);
	const { items, total, page, limit } = await getMovementLogService(params);

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<HeaderPage
				title="Movement log"
				description={`${total.toLocaleString()} stock movements`}
				showDashboardBtn={false}
			/>

			<MovementLogToolbar
				q={params.q}
				type={params.type}
				status={params.status}
			/>

			<Card>
				<CardContent sx={{ p: 0 }}>
					<MovementLogTable items={items} />
					<DataTablePagination page={page} limit={limit} total={total} />
				</CardContent>
			</Card>
		</main>
	);
}
