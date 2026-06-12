"use client";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
	AppBar,
	Avatar,
	Box,
	Breadcrumbs,
	Button,
	Toolbar,
	Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
	const router = useRouter();
	const pathname = usePathname();

	const { data: session, isPending } = authClient.useSession();

	const [isSigningOut, setIsSigningOut] = useState(false);

	const userName = session?.user?.name || "Warehouse User";
	const userEmail = session?.user?.email || "Signed In";

	const userInitial = userName.charAt(0).toUpperCase();

	async function handleSignOut() {
		setIsSigningOut(true);

		try {
			await authClient.signOut();

			router.replace(ROUTES.LOGIN);
			router.refresh();
		} catch (error) {
			console.error(error);
		} finally {
			setIsSigningOut(false);
		}
	}

	const segments = pathname.split("/").filter(Boolean);

	const pageName = segments[segments.length - 1] || "dashboard";

	const formattedPageName = pageName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return (
		<AppBar
			position="static"
			elevation={0}
			color="inherit"
			sx={{
				bgcolor: "background.paper",
				borderBottom: 1,
				borderColor: "divider",
				p: 1,
			}}
		>
			<Toolbar
				sx={{
					minHeight: 64,
					px: 3,
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				{/* Left */}
				<Box>
					<Breadcrumbs
						separator={<NavigateNextIcon fontSize="small" />}
						sx={{
							color: "text.secondary",
						}}
					>
						<Link
							href={ROUTES.DASHBOARD.HOME}
							style={{
								textDecoration: "none",
								color: "inherit",
							}}
						>
							Inventory Management
						</Link>

						<Typography
							variant="body2"
							sx={{
								color: "text.primary",
								fontWeight: 600,
							}}
						>
							{formattedPageName}
						</Typography>
					</Breadcrumbs>

					<Typography
						variant="h6"
						sx={{
							mt: 0.5,
							fontWeight: 700,
						}}
					>
						{formattedPageName}
					</Typography>
				</Box>

				{/* Right */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						p: 1,
						pl: 2,
						border: 1,
						borderColor: "divider",
						borderRadius: 3,
						bgcolor: "background.default",
					}}
				>
					<Avatar
						sx={{
							bgcolor: "primary.main",
							width: 40,
							height: 40,
						}}
					>
						{isPending ? "..." : userInitial}
					</Avatar>

					<Box>
						<Typography variant="body2" sx={{ fontWeight: 600 }}>
							{isPending ? "Loading..." : userName}
						</Typography>

						<Typography variant="caption" color="text.secondary">
							{isPending ? "Fetching account..." : userEmail}
						</Typography>
					</Box>

					<Button
						size="small"
						variant="outlined"
						color="inherit"
						onClick={handleSignOut}
						disabled={isPending || isSigningOut}
					>
						{isSigningOut ? "Signing out..." : "Sign out"}
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
