"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import { user } from "@/app/db/schema";
import { auth } from "@/lib/auth";
import {
	assignRoleService,
	assignUserRoleService,
	toggleDisabledService,
	updateUserService,
} from "./service";
import type {
	ActionResult,
	CreateUserInput,
	UpdateUserInput,
	User,
	UserRole,
} from "./types";

const USERS_PATH = "/dashboard/users";

// export async function createUserAction(
//   input: CreateUserInput,
// ): Promise<ActionResult<User>> {
//   const result = await createUserService(input);
//   if (result.success) revalidatePath(USERS_PATH);
//   return result;
// }

export async function createUserAction(input: CreateUserInput) {
	let userId: string | null = null;

	try {
		const result = await auth.api.createUser({
			body: {
				email: input.email,
				password: input.password,
				name: input.name,
			},
		});

		userId = result.user.id;

		await assignUserRoleService(result.user.id, input.role);

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		// rollback
		if (userId) {
			await db.delete(user).where(eq(user.id, userId));
		}

		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to create user",
		};
	}
}

export async function updateUserAction(
	id: string,
	input: UpdateUserInput,
): Promise<ActionResult<User>> {
	const result = await updateUserService(id, input);
	if (result.success) revalidatePath(USERS_PATH);
	return result;
}

export async function toggleDisabledAction(
	id: string,
	disabled: boolean,
): Promise<ActionResult> {
	const result = await toggleDisabledService(id, disabled);
	if (result.success) revalidatePath(USERS_PATH);
	return result;
}

export async function assignRoleAction(
	id: string,
	role: UserRole,
): Promise<ActionResult> {
	const result = await assignRoleService(id, role);
	if (result.success) revalidatePath(USERS_PATH);
	return result;
}
