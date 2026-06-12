"use client";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";
import { ROLES } from "@/constants/users";
import { createUserAction, updateUserAction } from "@/features/users/actions";
import type {
	AuthRole,
	CreateUserInput,
	SerializedUser,
	UpdateUserInput,
} from "@/features/users/types";
import { Field } from "../field";
import { inputStyle } from "../input-style";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserModalProps {
	mode: "create" | "edit";
	user?: SerializedUser | null;
	onClose: () => void;
	onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UserModal({ mode, user, onClose, onSuccess }: UserModalProps) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authRole, setAuthRole] = useState<AuthRole>("STOCK_USER");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Sync fields when user prop changes (edit mode)
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setName(user?.name ?? "");
		setEmail(user?.email ?? "");
		setAuthRole(user?.authRole ?? "STOCK_USER");
		setPassword("");
		setError("");
	}, [user]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			let result: { success: boolean; error?: string };

			if (mode === "create") {
				const input: CreateUserInput = {
					name,
					email,
					password,
					authRole,
					role: authRole === "OWNER" ? "admin" : "user",
				};
				result = await createUserAction(input);
			} else {
				if (!user) return;
				const input: UpdateUserInput = {
					name,
					email,
					authRole,
					role: authRole === "OWNER" ? "admin" : "user",
				};
				result = await updateUserAction(user.id, input);
			}

			if (result.success) {
				onSuccess();
				onClose();
			} else {
				setError(result.error ?? "Unknown error");
			}
		} catch {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	const isCreate = mode === "create";

	return (
		/* Backdrop */
		<Dialog open onClose={onClose} maxWidth="xs" fullWidth>
			{/* Panel */}
			<div className="w-full max-w-md rounded-2xl ">
				{/* Header */}
				<div
					className="flex items-center justify-between px-6 py-4 bg-[#185FA5] text-white"
					style={{
						borderBottom: "1px solid #2a2a2a",
					}}
				>
					<div>
						<h2 className="text-base font-semibold">
							{isCreate ? "Create new user" : "Edit user"}
						</h2>
						<p className="text-xs mt-0.5" style={{ color: "#ccc" }}>
							{isCreate
								? "Add a team member and assign their role"
								: "Update profile details and permissions"}
						</p>
					</div>
					<button
						id="modal-close-btn"
						type="button"
						onClick={onClose}
						aria-label="Close modal"
						className="flex items-center justify-center rounded-lg text-sm font-medium text-white hover:bg-[#1e3a8a] transition-colors"
						style={{
							width: 32,
							height: 32,
							border: "1px solid #333",
						}}
					>
						✕
					</button>
				</div>

				{/* Body */}
				<form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
					{/* Error banner */}
					{error && (
						<div
							className="rounded-xl px-4 py-3 text-sm"
							style={{
								background: "rgba(127,29,29,0.35)",
								border: "1px solid #7f1d1d",
								color: "#fca5a5",
							}}
						>
							{error}
						</div>
					)}

					<Field id="modal-name" label="Full Name">
						<input
							id="modal-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							placeholder="e.g. Somchai Jaidee"
							style={inputStyle}
						/>
					</Field>

					<Field id="modal-email" label="Email address">
						<input
							id="modal-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							placeholder="somchai@company.com"
							style={inputStyle}
						/>
					</Field>

					{isCreate && (
						<Field id="modal-password" label="Password">
							<TextField
								fullWidth
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								placeholder="Min. 8 characters"
								variant="outlined"
								size="small"
								slotProps={{
									htmlInput: {
										minLength: 8,
									},
									input: {
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowPassword((prev) => !prev)}
													edge="end"
													size="small"
												>
													{showPassword ? (
														<VisibilityOff fontSize="small" />
													) : (
														<Visibility fontSize="small" />
													)}
												</IconButton>
											</InputAdornment>
										),
									},
								}}
							/>
						</Field>
					)}

					{/* Role selector */}
					<Field id="modal-role" label="Role">
						<div className="flex flex-col gap-2">
							{ROLES.map((r) => (
								<label
									key={r.value}
									htmlFor={`modal-role-${r.value}`}
									className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
									style={{
										background:
											authRole === r.value ? "rgba(37,99,235,0.12)" : "#fff",
										border: `1.5px solid ${
											authRole === r.value ? "#2563eb" : "#e5e7eb"
										}`,
									}}
								>
									<input
										id={`modal-role-${r.value}`}
										type="radio"
										name="user-role"
										value={r.value}
										checked={authRole === r.value}
										onChange={() => setAuthRole(r.value)}
										className="accent-blue-600"
									/>
									<div>
										<div>
											<div
												className="text-sm font-medium"
												style={{
													color: authRole === r.value ? "#2563eb" : "inherit",
												}}
											>
												{r.label}
											</div>

											<div
												className="text-xs"
												style={{
													color: authRole === r.value ? "#60a5fa" : "#666",
												}}
											>
												{r.desc}
											</div>
										</div>
									</div>
								</label>
							))}
						</div>
					</Field>

					{/* Actions */}
					<div className="flex gap-3 pt-1">
						<button
							id="modal-cancel-btn"
							type="button"
							onClick={onClose}
							className="flex-1 rounded-xl py-2.5 text-sm font-medium"
							style={{
								background: "background.paper",
								color: "#aaa",
								border: "1px solid #333",
							}}
						>
							Cancel
						</button>
						<button
							id="modal-submit-btn"
							type="submit"
							disabled={loading}
							className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
							style={{ background: loading ? "#1e3a8a" : "#185FA5" }}
						>
							{loading
								? isCreate
									? "Creating…"
									: "Saving…"
								: isCreate
									? "Create User"
									: "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</Dialog>
	);
}
