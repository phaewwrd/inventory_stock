"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "@/constants/routes";

export function StockTransactionTabs() {
	const pathname = usePathname();
	const router = useRouter();

	const value = pathname.startsWith(ROUTES.DASHBOARD.STOCK.CUT)
		? "cut"
		: "receive";

	return (
		<Tabs
			value={value}
			onChange={(_event, next) =>
				router.push(
					next === "cut"
						? ROUTES.DASHBOARD.STOCK.CUT
						: ROUTES.DASHBOARD.STOCK.RECEIVE,
				)
			}
			sx={{ mb: 3 }}
		>
			<Tab value="receive" label="↓ Receive" />
			<Tab value="cut" label="✂ Cut stock" />
		</Tabs>
	);
}
