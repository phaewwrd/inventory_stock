"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, Suspense, useState } from "react";

import { AuthPageFallback } from "@/components/auth-page-fallback";
import { authClient } from "@/lib/auth-client";
import { getAlternateAuthHref, getAuthRedirectTarget } from "@/lib/auth-page";

function SignUpPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const redirectTo = getAuthRedirectTarget(searchParams.get("redirectTo"));

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		setLoading(true);

		try {
			const result = await authClient.signUp.email({
				email,
				password,
				name,
				authRole: "STOCK_USER",
			});

			if (result.error) {
				setError(
					result.error.message || "Failed to create account. Please try again.",
				);
				return;
			}

			router.replace(redirectTo);
			router.refresh();
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to create account. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<span className="text-white text-2xl font-bold">S</span>
					</div>
					<h2 className="text-3xl font-bold text-gray-900">
						Create your account
					</h2>
					<p className="text-gray-600 mt-2">Get started with StockMS today</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
					{error && (
						<div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Full name
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="John Doe"
								required
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Email address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••••••"
								required
								minLength={8}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Must be at least 8 characters
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Confirm password
							</label>
							<input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="••••••••••••"
								required
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Creating account..." : "Create account"}
						</button>
					</form>
				</div>

				<p className="text-center text-sm text-gray-600 mt-6">
					Already have an account?{" "}
					<Link
						href={getAlternateAuthHref("/login", redirectTo)}
						className="text-blue-600 hover:text-blue-700 font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

export default function SignUpPage() {
	return (
		<Suspense fallback={<AuthPageFallback />}>
			<SignUpPageContent />
		</Suspense>
	);
}
