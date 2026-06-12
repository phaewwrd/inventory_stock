"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		setSubmitted(true);
		setLoading(false);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
						<span className="text-white text-2xl font-bold">S</span>
					</div>
					<h2 className="text-3xl font-bold text-gray-900">
						Reset your password
					</h2>
					<p className="text-gray-600 mt-2">
						{submitted
							? "Check your email for reset instructions"
							: "Enter your email and we'll send you a reset link"}
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
					{submitted ? (
						<div className="text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Success</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<p className="text-gray-700 mb-6">
								If an account exists for <strong>{email}</strong>, you will
								receive a password reset link shortly.
							</p>
							<a
								href="/login"
								className="inline-block text-blue-600 hover:text-blue-700 font-medium"
							>
								← Back to sign in
							</a>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-5">
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

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Sending..." : "Send reset link"}
							</button>

							<div className="text-center">
								<a
									href="/login"
									className="text-sm text-blue-600 hover:text-blue-700 font-medium"
								>
									← Back to sign in
								</a>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
