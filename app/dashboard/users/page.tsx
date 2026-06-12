import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HeaderPage } from "@/components/header-page";
import { UserStats } from "@/components/users/user-stats";
import { UserTable } from "@/components/users/user-table";
import { ROUTES } from "@/constants/routes";
import { getUsersService } from "@/features/users/service";
import type { SerializedUser } from "@/features/users/types";
import { auth } from "@/lib/auth";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
	title: "User Management | StockMS",
	description:
		"จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ — create, edit, disable accounts and assign roles.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function UsersPage() {
	const headersList = await headers();
	const session = await auth.api.getSession({ headers: headersList });

	if (session?.user?.authRole !== "OWNER") {
		redirect(ROUTES.DASHBOARD.HOME);
	}

	const rawUsers = await getUsersService();

	// Serialize Date → string for the client boundary
	const users: SerializedUser[] = rawUsers.map((u) => ({
		...u,
		createdAt: u.createdAt.toISOString(),
		updatedAt: u.updatedAt.toISOString(),
	}));

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<HeaderPage
				title="User Management"
				description="จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ"
			/>

			<Stack spacing={3}>
				<UserStats users={users} />

				<Card>
					<CardContent sx={{ p: 3 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 2,
								mb: 3,
								flexWrap: "wrap",
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 600 }}>
								All Users
							</Typography>

							<Chip
								label={users.length.toLocaleString()}
								size="small"
								color="default"
								variant="outlined"
							/>
						</Box>

						<UserTable initialUsers={users} />
					</CardContent>
				</Card>
			</Stack>
		</main>
	);
}
