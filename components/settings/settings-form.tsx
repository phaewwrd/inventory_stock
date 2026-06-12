"use client";

import {
	Avatar,
	Box,
	Card,
	Chip,
	List,
	ListItemButton,
	ListItemText,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { EmailSection } from "./email-section";
import { PasswordSection } from "./password-section";
import { ProfileSection } from "./profile-section";

type Section = "profile" | "email" | "password";

interface SettingsFormProps {
	userName: string;
	userEmail: string;
	userInitial: string;
	userRole: string;
}

export function SettingsForm({
	userName,
	userEmail,
	userInitial,
	userRole,
}: SettingsFormProps) {
	const [activeSection, setActiveSection] = useState<Section>("profile");

	const menuItems = [
		{
			value: "profile",
			label: "Profile",
		},
		{
			value: "email",
			label: "Email",
		},
		{
			value: "password",
			label: "Password",
		},
	] satisfies {
		value: Section;
		label: string;
	}[];

	return (
		<Box
			sx={{
				display: "flex",
				gap: 3,
				alignItems: "flex-start",
			}}
		>
			{/* Sidebar */}
			<Card
				sx={{
					width: 220,
					p: 2,
					borderRadius: 4,
					border: "1px solid #e5e7eb",
					boxShadow: "none",
				}}
			>
				<Typography
					variant="overline"
					sx={{
						px: 1,
						color: "text.secondary",
						fontWeight: 700,
						letterSpacing: 1,
					}}
				>
					ACCOUNT
				</Typography>

				<List sx={{ mt: 1 }}>
					{menuItems.map((item) => (
						<ListItemButton
							key={item.value}
							selected={activeSection === item.value}
							onClick={() => setActiveSection(item.value)}
							sx={{
								borderRadius: 2,
								mb: 0.5,

								"&.Mui-selected": {
									bgcolor: "primary.main",
									color: "white",

									"&:hover": {
										bgcolor: "primary.dark",
									},
								},
							}}
						>
							<ListItemText primary={item.label} />
						</ListItemButton>
					))}
				</List>
			</Card>

			{/* Content */}
			<Box
				sx={{
					flex: 1,
					minWidth: 0,
					display: "flex",
					flexDirection: "column",
					gap: 3,
				}}
			>
				{/* User Card */}
				<Card
					sx={{
						p: 3,
						borderRadius: 4,
						border: "1px solid #e5e7eb",
						boxShadow: "none",
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
						}}
					>
						<Avatar
							sx={{
								width: 56,
								height: 56,
								fontSize: 22,
								fontWeight: 700,
							}}
						>
							{userInitial}
						</Avatar>

						<Box
							sx={{
								flex: 1,
								minWidth: 0,
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
								{userName}
							</Typography>

							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ fontWeight: 400 }}
								noWrap
							>
								{userEmail}
							</Typography>
						</Box>

						<Chip label={userRole} color="primary" variant="outlined" />
					</Box>
				</Card>

				{/* Sections */}
				{activeSection === "profile" && (
					<ProfileSection currentName={userName} />
				)}

				{activeSection === "email" && <EmailSection currentEmail={userEmail} />}

				{activeSection === "password" && <PasswordSection />}
			</Box>
		</Box>
	);
}
