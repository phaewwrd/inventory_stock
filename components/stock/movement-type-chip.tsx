import Chip from "@mui/material/Chip";

import type { MovementType } from "@/features/stock/types";

const TYPE_STYLES: Record<
	MovementType,
	{ label: string; color: "success" | "error" | "default" }
> = {
	receive: { label: "Receive", color: "success" },
	issue: { label: "Cut", color: "error" },
	adjustment: { label: "Adjust", color: "default" },
};

export function MovementTypeChip({ type }: { type: MovementType }) {
	const style = TYPE_STYLES[type];
	return (
		<Chip
			label={style.label}
			color={style.color}
			size="small"
			variant="outlined"
		/>
	);
}
