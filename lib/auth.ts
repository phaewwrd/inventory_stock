import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { db } from "@/app/db";
import * as authSchema from "@/app/db/auth-schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: authSchema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "user",
			},
			authRole: {
				type: "string",
				defaultValue: "STOCK_USER",
			},
			disabled: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
		},
		changeEmail: {
			enabled: true,
			// Internal system — skip email verification on change
			sendVerificationEmail: async () => {},
		},
	},
	plugins: [nextCookies(), admin()],
});
