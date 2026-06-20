"use client";

import { Avatar, Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";

export function UserCard() {
	const router = useRouter();
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

	return (
		<Box
			sx={{
				p: 2,
				borderTop: 1,
				borderColor: "divider",
				bgcolor: "background.default",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 2,
					mb: 2,
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

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
						{isPending ? "Loading..." : userName}
					</Typography>

					<Typography variant="caption" color="text.secondary" noWrap>
						{isPending ? "Fetching account..." : userEmail}
					</Typography>
				</Box>
			</Box>

			<Button
				fullWidth
				size="small"
				variant="outlined"
				color="inherit"
				onClick={handleSignOut}
				disabled={isPending || isSigningOut}
			>
				{isSigningOut ? "Signing out..." : "Sign out"}
			</Button>
		</Box>
	);
}
