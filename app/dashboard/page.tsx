"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Alert, Box, Button, Card, Chip, Typography } from "@mui/material";
import {
	useExpiryReport,
	useProductReport,
	useStockIssuedReport,
	useStockReceivedReport,
} from "@/features/reports/hooks";
import { authClient } from "@/lib/auth-client";

const panelSx = {
	p: 3,
	borderRadius: 4,
	bgcolor: "background.paper",
	border: "1px solid",
	borderColor: "divider",
	boxShadow: "none",
};

export default function DashboardPage() {
	const { data: session, isPending } = authClient.useSession();

	const defaultFilter = {
		preset: "last30days" as const,
		customStart: null,
		customEnd: null,
	};

	const productQuery = useProductReport(defaultFilter);
	const expiryQuery = useExpiryReport(defaultFilter);
	const receivedQuery = useStockReceivedReport(defaultFilter);
	const issuedQuery = useStockIssuedReport(defaultFilter);

	const today = new Date();

	const dateStr = today.toLocaleDateString("en-US", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const userName = session?.user.name || "Warehouse User";

	const productSummary = productQuery.data?.summary;
	const expirySummary = expiryQuery.data?.summary;
	const dashboardErrors = [
		productQuery.error?.message,
		expiryQuery.error?.message,
		receivedQuery.error?.message,
		issuedQuery.error?.message,
	].filter((message): message is string => Boolean(message));
	const dashboardError = dashboardErrors[0] ?? null;

	const statCards = [
		{
			icon: <Inventory2OutlinedIcon />,
			bg: "#2563eb",
			value: productSummary?.totalProducts.toLocaleString() ?? "0",
			valueColor: "#2563eb",
			label: "Total Products",
			sub: "Active inventory items",
		},
		{
			icon: <WarningAmberOutlinedIcon />,
			bg: "#f59e0b",
			value: productSummary?.lowStockProducts.toLocaleString() ?? "0",
			valueColor: "#f59e0b",
			label: "Low Stock Alerts",
			sub: "Below reorder level",
		},
		{
			icon: <ScheduleOutlinedIcon />,
			bg: "#ea580c",
			value: expirySummary?.criticalItems.toLocaleString() ?? "0",
			valueColor: "#ea580c",
			label: "Near Expiry",
			sub: "Within 30 days",
		},
		{
			icon: <ErrorOutlineOutlinedIcon />,
			bg: "#dc2626",
			value: expirySummary?.totalExpired.toLocaleString() ?? "0",
			valueColor: "#dc2626",
			label: "Expired Products",
			sub: "Requires action",
		},
	];

	const recentTransactions = [
		...(receivedQuery.data?.items ?? []).map((item) => ({
			name: item.productName,
			detail: `Lot #${item.lotNo} · Receive`,
			qty: `+${item.quantity.toLocaleString()} ${item.unit}`,
			positive: true,
			date: new Date(item.date),
		})),
		...(issuedQuery.data?.items ?? []).map((item) => ({
			name: item.productName,
			detail: `Lot #${item.lotNo ?? "N/A"} · Issue`,
			qty: `-${item.quantity.toLocaleString()} ${item.unit}`,
			positive: false,
			date: new Date(item.date),
		})),
	]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 5);

	const expiryWatch = (expiryQuery.data?.items ?? [])
		.filter((item) => item.status === "expired" || item.status === "critical")
		.sort(
			(a, b) =>
				new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
		)
		.slice(0, 5)
		.map((item) => ({
			name: item.productName,
			lot: `Lot #${item.lotNo}`,
			expiry: new Date(item.expiryDate).toLocaleDateString("en-US", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			}),
			status: item.status === "expired" ? "expired" : "near",
		}));

	return (
		<Box
			sx={{
				p: 4,
				height: "100%",
				boxSizing: "border-box",
				mb: 3,
			}}
		>
			{" "}
			{/* Header */}
			<Box
				sx={{
					mb: 4,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					flexWrap: "wrap",
					gap: 2,
				}}
			>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 700 }}>
						Overview
					</Typography>

					<Typography variant="body2" color="text.secondary">
						{dateStr} • Warehouse A
					</Typography>

					{!isPending && (
						<Typography variant="body2" color="text.secondary">
							Signed in as {userName}
						</Typography>
					)}
				</Box>

				<Button
					variant="contained"
					startIcon={<AddOutlinedIcon />}
					sx={{
						borderRadius: 3,
						textTransform: "none",
						px: 3,
						height: 44,
					}}
				>
					New Transaction
				</Button>
			</Box>
			{dashboardError && (
				<Alert severity="error" sx={{ mb: 3 }}>
					{dashboardError}
				</Alert>
			)}
			{/* Stats */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2,1fr)",
						lg: "repeat(4,1fr)",
					},
					gap: 2,
					mb: 3,
				}}
			>
				{statCards.map((card) => (
					<Card
						key={card.label}
						sx={{
							...panelSx,
							transition: "0.2s",

							"&:hover": {
								transform: "translateY(-2px)",
								boxShadow: 3,
							},
						}}
					>
						<Box
							sx={{
								width: 52,
								height: 52,
								borderRadius: 3,
								bgcolor: `${card.bg}15`,
								color: card.bg,

								display: "flex",
								alignItems: "center",
								justifyContent: "center",

								mb: 2,

								"& svg": {
									fontSize: 28,
								},
							}}
						>
							{card.icon}
						</Box>

						<Typography
							variant="h4"
							sx={{
								fontWeight: 700,
								color: card.valueColor,
							}}
						>
							{card.value}
						</Typography>

						<Typography
							variant="body2"
							sx={{
								mt: 0.5,
								fontWeight: 600,
							}}
						>
							{card.label}
						</Typography>

						<Typography variant="caption" color="text.secondary">
							{card.sub}
						</Typography>
					</Card>
				))}
			</Box>
			{/* Bottom Panels */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						md: "1fr 1fr",
					},
					gap: 2,
				}}
			>
				{/* Recent Transactions */}
				<Card sx={panelSx}>
					<Box
						sx={{
							mb: 3,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography sx={{ fontWeight: 600 }}>
							Recent Transactions
						</Typography>

						{/* <Button size="small" startIcon={<VisibilityOutlinedIcon />}>
							View All
						</Button> */}
					</Box>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						{recentTransactions.length === 0 ? (
							<Typography variant="body2" color="text.secondary">
								No recent transactions for this period.
							</Typography>
						) : (
							recentTransactions.map((tx) => (
								<Box
									key={tx.name + tx.detail}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
									}}
								>
									<Box
										sx={{
											width: 40,
											height: 40,
											borderRadius: 2,
											bgcolor: tx.positive ? "success.light" : "error.light",

											color: tx.positive ? "success.main" : "error.main",

											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										{tx.positive ? (
											<ArrowUpwardOutlinedIcon fontSize="small" />
										) : (
											<ArrowDownwardOutlinedIcon fontSize="small" />
										)}
									</Box>

									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontWeight: 500 }}>{tx.name}</Typography>

										<Typography variant="caption" color="text.secondary">
											{tx.detail}
										</Typography>
									</Box>

									<Typography
										sx={{
											fontWeight: 600,
											color: tx.positive ? "success.main" : "error.main",
										}}
									>
										{tx.qty}
									</Typography>
								</Box>
							))
						)}
					</Box>
				</Card>

				{/* Expiry Watch */}
				<Card sx={panelSx}>
					<Box
						sx={{
							mb: 3,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography sx={{ fontWeight: 600 }}>Expiry Watch</Typography>

						{/* <Button size="small" startIcon={<VisibilityOutlinedIcon />}>
							View All
						</Button> */}
					</Box>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							gap: 2,
						}}
					>
						{expiryWatch.length === 0 ? (
							<Typography variant="body2" color="text.secondary">
								No near-expiry or expired lots found.
							</Typography>
						) : (
							expiryWatch.map((item) => (
								<Box
									key={item.name + item.lot}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
									}}
								>
									<Box
										sx={{
											width: 40,
											height: 40,
											borderRadius: 2,

											bgcolor:
												item.status === "expired" ? "#fee2e2" : "#fef3c7",

											color: item.status === "expired" ? "#dc2626" : "#d97706",

											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										{item.status === "expired" ? (
											<ErrorOutlineOutlinedIcon fontSize="small" />
										) : (
											<WarningAmberOutlinedIcon fontSize="small" />
										)}
									</Box>

									<Box sx={{ flex: 1 }}>
										<Typography sx={{ fontWeight: 500 }}>
											{item.name}
										</Typography>

										<Typography variant="caption" color="text.secondary">
											{item.lot}
										</Typography>
									</Box>

									<Box sx={{ textAlign: "right" }}>
										<Chip
											size="small"
											label={
												item.status === "expired" ? "Expired" : "Near Expiry"
											}
											color={item.status === "expired" ? "error" : "warning"}
										/>

										<Typography
											variant="caption"
											sx={{
												mt: 0.5,
												display: "block",
												color: "text.secondary",
											}}
										>
											{item.expiry}
										</Typography>
									</Box>
								</Box>
							))
						)}
					</Box>
				</Card>
			</Box>
		</Box>
	);
}
