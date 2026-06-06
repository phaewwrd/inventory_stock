import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";

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
  plugins: [nextCookies()],
});