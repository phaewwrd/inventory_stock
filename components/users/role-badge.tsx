"use client";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";

import type { AuthRole } from "@/features/users/types";

interface RoleBadgeProps {
	role: AuthRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
	const theme = useTheme();

	const config = {
		OWNER: {
			label: "Owner",
			bg: theme.palette.semantic.primaryBg,
			color: theme.palette.primary.main,
		},
		STOCK_MANAGER: {
			label: "Stock Manager",
			bg: theme.palette.semantic.warningBg,
			color: theme.palette.semantic.warningText,
		},
		STOCK_USER: {
			label: "Stock User",
			bg: theme.palette.semantic.surface2,
			color: theme.palette.text.secondary,
		},
	} satisfies Record<
		AuthRole,
		{
			label: string;
			bg: string;
			color: string;
		}
	>;

	const current = config[role];

	return (
		<Chip
			label={current.label}
			size="small"
			sx={{
				bgcolor: current.bg,
				color: current.color,
				border: "none",
				fontWeight: 500,
			}}
		/>
	);
}
