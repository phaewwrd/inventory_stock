import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function HeaderPage({
	title,
	description,
	custombtn,
	showDashboardBtn = true,
}: {
	title: string;
	description: string;
	custombtn?: React.ReactNode;
	showDashboardBtn?: boolean;
}) {
	return (
		<div className="flex items-center justify-between mb-6">
			<div>
				<h1 className="text-2xl font-bold ">{title}</h1>
				<p className="text-sm mt-0.5" style={{ color: "#666" }}>
					{description}
				</p>
			</div>

			{/* Quick back link */}
			{showDashboardBtn && (
				<Link
					href={ROUTES.DASHBOARD.HOME}
					className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
					style={{
						border: "1.5px solid #2e2e2e",
						color: "#777",
						background: "transparent",
					}}
				>
					← Dashboard
				</Link>
			)}
			{custombtn && <div className="flex items-center h-full">{custombtn}</div>}
		</div>
	);
}
