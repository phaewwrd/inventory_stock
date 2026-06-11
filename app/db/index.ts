import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL!;

const queryClient = postgres(databaseUrl);
export const db = drizzle(queryClient);
