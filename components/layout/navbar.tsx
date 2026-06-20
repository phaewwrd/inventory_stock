"use client";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { AppBar, Breadcrumbs, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function Navbar() {
	const pathname = usePathname();

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
			}}
		>
			<Toolbar sx={{ minHeight: 64, px: 3 }}>
				<Breadcrumbs
					separator={<NavigateNextIcon fontSize="small" />}
					sx={{ color: "text.secondary" }}
				>
					<Link
						href={ROUTES.DASHBOARD.HOME}
						style={{ textDecoration: "none", color: "inherit" }}
					>
						Inventory Management
					</Link>

					<Typography
						variant="body2"
						sx={{ color: "text.primary", fontWeight: 600 }}
					>
						{formattedPageName}
					</Typography>
				</Breadcrumbs>
			</Toolbar>
		</AppBar>
	);
}
