import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

// ponytail: native App Router loading.tsx → Suspense skeleton on nav to /products.
// Filter changes (same route) won't trigger this; wrap the table in <Suspense
// key={searchParams}> if you want per-filter skeletons too.
export default function ProductsLoading() {
	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			{/* Header */}
			<Stack
				direction="row"
				sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}
			>
				<Box>
					<Skeleton variant="text" width={160} height={40} />
					<Skeleton variant="text" width={200} height={24} />
				</Box>
				<Skeleton variant="rounded" width={140} height={40} />
			</Stack>

			{/* Toolbar */}
			<Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
				<Skeleton variant="rounded" width={320} height={40} />
				<Skeleton variant="rounded" width={140} height={40} />
			</Stack>

			{/* Table */}
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
				</CardContent>
			</Card>
		</main>
	);
}
