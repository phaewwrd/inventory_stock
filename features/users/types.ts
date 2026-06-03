// ─── Domain types ────────────────────────────────────────────────────────────

export type UserRole = "OWNER" | "STOCK_MANAGER" | "STOCK_USER";

/** Server-side representation (Date objects). */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  disabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client-side representation passed from RSC to Client Components.
 * Dates are ISO strings after Next.js serialises them across the boundary.
 */
export type SerializedUser = Omit<User, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  role: UserRole;
}

// ─── Action result ───────────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
