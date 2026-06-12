"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { KPIData } from "@/features/reports/types";

interface KPICardProps {
	data: KPIData;
}

export function KPICard({ data }: KPICardProps) {
	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Stack spacing={1}>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ fontWeight: 500, textTransform: "uppercase" }}
					>
						{data.label}
					</Typography>
					<Typography
						variant="h3"
						sx={{
							fontWeight: 600,
							color: data.color || "text.primary",
						}}
					>
						{data.value}
					</Typography>
					{data.changeLabel && (
						<Typography
							variant="caption"
							color={
								data.trend === "up"
									? "success.main"
									: data.trend === "down"
										? "error.main"
										: "text.secondary"
							}
							sx={{ fontWeight: 500 }}
						>
							{data.change != null &&
								`${data.change > 0 ? "+" : ""}${data.change}% `}
							{data.changeLabel}
						</Typography>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}

interface KPIGridProps {
	kpis: KPIData[];
}

export function KPIGrid({ kpis }: KPIGridProps) {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
				gap: 16,
			}}
		>
			{kpis.map((kpi) => (
				<KPICard key={kpi.label} data={kpi} />
			))}
		</div>
	);
}
