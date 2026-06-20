import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

/** Table-only placeholder shown while the products list (re)loads on filter change. */
export function ProductsTableSkeleton() {
	return (
		<Card>
			<CardContent sx={{ p: 0 }}>
				{Array.from({ length: 10 }).map((_, i) => (
					<Skeleton
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder rows
						key={i}
						variant="rectangular"
						height={53}
						sx={{ mx: 2, my: 1, borderRadius: 1 }}
					/>
				))}
				<Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
					<Skeleton variant="rounded" width={280} height={32} />
				</Box>
			</CardContent>
		</Card>
	);
}
