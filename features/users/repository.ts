import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { user } from "@/app/db/auth-schema";

import type { AuthRole, User, UserRole } from "./types";

// ─── Shared select shape ──────────────────────────────────────────────────────

const userCols = {
	id: user.id,
	name: user.name,
	email: user.email,
	authRole: user.authRole,
	role: user.role,
	disabled: user.disabled,
	emailVerified: user.emailVerified,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findAllUsers(): Promise<User[]> {
	return db.select(userCols).from(user).orderBy(desc(user.createdAt));
}

export async function findUserById(id: string): Promise<User | null> {
	const [row] = await db
		.select(userCols)
		.from(user)
		.where(eq(user.id, id))
		.limit(1);
	return row ?? null;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function insertUser(data: {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	authRole: AuthRole;
}): Promise<User | null> {
	const [row] = await db
		.insert(user)
		.values({
			...data,
			emailVerified: false,
			disabled: false,
		})
		.returning(userCols);
	return row ?? null;
}

export async function patchUser(
	id: string,
	data: {
		name?: string;
		email?: string;
		role?: UserRole;
		authRole?: AuthRole;
		disabled?: boolean;
	},
): Promise<User | null> {
	const [row] = await db
		.update(user)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(user.id, id))
		.returning(userCols);
	return row ?? null;
}
export async function updateUserRoleRepository(userId: string, role: UserRole) {
	await db
		.update(user)
		.set({
			role,
		})
		.where(eq(user.id, userId));
}
