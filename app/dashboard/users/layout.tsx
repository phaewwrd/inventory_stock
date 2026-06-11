import { Stack } from "@mui/material";
import { redirect } from "next/dist/client/components/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function UsersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth.api.getSession({ headers: await headers() });

	const user = session?.user;

	if (user?.authRole !== "OWNER") {
		redirect("/dashboard");
	}

	return (
		<Stack
			spacing={2}
			sx={{
				height: "100%",
				overflow: "hidden",
				backgroundColor: "background.default",
			}}
		>
			{children}
		</Stack>
	);
}
