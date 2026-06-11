import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HeaderPage } from "@/components/header-page";
import { SettingsForm } from "@/components/settings/settings-form";
import { ROUTES } from "@/constants/routes";
import { auth } from "@/lib/auth";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
	title: "Settings | StockMS",
	description: "Manage your personal account settings.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
	const headersList = await headers();
	const session = await auth.api.getSession({
		headers: headersList,
	});

	if (!session) {
		redirect(ROUTES.LOGIN);
	}

	const { user } = session;
	const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

	return (
		<main className="flex-1 overflow-y-auto px-8 py-7">
			<Stack spacing={3}>
				<HeaderPage
					title="Account Settings"
					description="Manage your profile, email, and password"
				/>

				<Box sx={{ maxWidth: 960 }}>
					<SettingsForm
						userName={user.name || ""}
						userEmail={user.email || ""}
						userInitial={userInitial}
						userRole={user.role || "STOCK_USER"}
					/>
				</Box>
			</Stack>
		</main>
	);
}
