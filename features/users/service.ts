import "server-only";

import { randomUUID } from "node:crypto";

import { account } from "@/app/db/auth-schema";
import { db } from "@/app/db";

import { findAllUsers, insertUser, patchUser } from "./repository";
import type {
  ActionResult,
  CreateUserInput,
  UpdateUserInput,
  User,
  UserRole,
} from "./types";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getUsersService(): Promise<User[]> {
  return findAllUsers();
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Creates a user by inserting directly into the user + account tables.
 * This avoids calling auth.api.signUpEmail which would set the new user's
 * session cookie on the admin's current response (nextCookies plugin side-effect).
 *
 * Password is hashed via the Web Crypto API (SHA-256 + salt) encoded as
 * "sha256:<salt>:<hex>" — a simple format for this internal system.
 * For production with stronger hashing, enable better-auth's admin plugin.
 */
export async function createUserService(
  input: CreateUserInput,
): Promise<ActionResult<User>> {
  try {
    const userId = randomUUID();
    const salt = randomUUID().replace(/-/g, "");
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + input.password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const hashedPassword = `sha256:${salt}:${hashHex}`;

    // Insert user record
    const newUser = await insertUser({
      id: userId,
      name: input.name,
      email: input.email,
      role: input.role,
    });

    if (!newUser) {
      return { success: false, error: "Failed to create user record." };
    }

    // Insert credential account record
    await db.insert(account).values({
      id: randomUUID(),
      accountId: input.email,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, data: newUser };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user.";
    // Surface duplicate email errors clearly
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { success: false, error: "A user with this email already exists." };
    }
    return { success: false, error: msg };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateUserService(
  id: string,
  input: UpdateUserInput,
): Promise<ActionResult<User>> {
  try {
    const updated = await patchUser(id, {
      name: input.name,
      email: input.email,
      role: input.role,
    });
    if (!updated) return { success: false, error: "User not found." };
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user.",
    };
  }
}

// ─── Toggle disabled ──────────────────────────────────────────────────────────

export async function toggleDisabledService(
  id: string,
  disabled: boolean,
): Promise<ActionResult> {
  try {
    const updated = await patchUser(id, { disabled });
    if (!updated) return { success: false, error: "User not found." };
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update user status.",
    };
  }
}

// ─── Assign role ──────────────────────────────────────────────────────────────

export async function assignRoleService(
  id: string,
  role: UserRole,
): Promise<ActionResult> {
  try {
    const updated = await patchUser(id, { role });
    if (!updated) return { success: false, error: "User not found." };
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to assign role.",
    };
  }
}
