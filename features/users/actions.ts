"use server";

import { revalidatePath } from "next/cache";

import {
  assignRoleService,
  createUserService,
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

export async function createUserAction(
  input: CreateUserInput,
): Promise<ActionResult<User>> {
  const result = await createUserService(input);
  if (result.success) revalidatePath(USERS_PATH);
  return result;
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
