import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./app/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		// biome-ignore lint/style/noNonNullAssertion: DATABASE_URL is required
		url: process.env.DATABASE_URL!,
	},
});
