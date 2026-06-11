import Stack from "@mui/material/Stack";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session?.user;

	if (!user) {
		redirect("/login");
	}

	return (
		<Stack
			direction="row"
			sx={{
				height: "100vh",
				overflow: "hidden",
				backgroundColor: "background.default",
			}}
		>
			<Sidebar />

			<div className="flex flex-col flex-1 overflow-hidden">
				<Navbar />
				{children}
			</div>
		</Stack>
	);
}
