import "server-only";

import { headers } from "next/headers";
import type { AuthRole } from "@/features/users/types";
import { auth } from "@/lib/auth";

/** Resolved session shape returned by Better Auth's getSession. */
type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * Thrown when the current user is missing a session or lacks an allowed role.
 * Callers decide how to react (redirect in pages, ActionResult error in actions).
 */
export class ForbiddenError extends Error {
	constructor(message = "You do not have permission to perform this action.") {
		super(message);
		this.name = "ForbiddenError";
	}
}

/**
 * Guards a server context to the given roles.
 *
 * @returns the active session when the user's role is allowed.
 * @throws ForbiddenError when there is no session or the role is not allowed.
 */
export async function requireRole(
	allowedRoles: Array<AuthRole>,
): Promise<AuthSession> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) {
		throw new ForbiddenError("You must be signed in.");
	}

	const role = session.user.authRole as AuthRole;
	if (!allowedRoles.includes(role)) {
		throw new ForbiddenError();
	}

	return session;
}
