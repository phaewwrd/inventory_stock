"use client";

import { useEffect, useState } from "react";

import {
  createUserAction,
  updateUserAction,
} from "@/features/users/actions";
import type {
  CreateUserInput,
  SerializedUser,
  UpdateUserInput,
  UserRole,
} from "@/features/users/types";
import { Field } from "../field";
import { inputStyle } from "../input-style";
import { ROLES } from "@/constants/users";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserModalProps {
  mode: "create" | "edit";
  user?: SerializedUser | null;
  onClose: () => void;
  onSuccess: () => void;
}




// ─── Component ────────────────────────────────────────────────────────────────

export function UserModal({ mode, user, onClose, onSuccess }: UserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("STOCK_USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync fields when user prop changes (edit mode)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setRole(user?.role ?? "STOCK_USER");
    setPassword("");
    setError("");
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;

      if (mode === "create") {
        const input: CreateUserInput = { name, email, password, role };
        result = await createUserAction(input);
      } else {
        if (!user) return;
        const input: UpdateUserInput = { name, email, role };
        result = await updateUserAction(user.id, input);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isCreate = mode === "create";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-md rounded-2xl"
        style={{
          background: "#1e1e1e",
          border: "1px solid #2e2e2e",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #2a2a2a" }}
        >
          <div>
            <h2 className="text-base font-semibold text-white">
              {isCreate ? "Create new user" : "Edit user"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#666" }}>
              {isCreate
                ? "Add a team member and assign their role"
                : "Update profile details and permissions"}
            </p>
          </div>
          <button
            id="modal-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex items-center justify-center rounded-lg text-sm font-medium"
            style={{
              width: 32,
              height: 32,
              background: "#2a2a2a",
              color: "#888",
              border: "1px solid #333",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Error banner */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(127,29,29,0.35)",
                border: "1px solid #7f1d1d",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <Field id="modal-name" label="Full Name">
            <input
              id="modal-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Somchai Jaidee"
              style={inputStyle}
            />
          </Field>

          <Field id="modal-email" label="Email address">
            <input
              id="modal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="somchai@company.com"
              style={inputStyle}
            />
          </Field>

          {isCreate && (
            <Field id="modal-password" label="Password">
              <input
                id="modal-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
            </Field>
          )}

          {/* Role selector */}
          <Field id="modal-role" label="Role">
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  htmlFor={`modal-role-${r.value}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    background: role === r.value ? "rgba(29,78,216,0.18)" : "#1a1a1a",
                    border: `1.5px solid ${role === r.value ? "#1d4ed8" : "#2e2e2e"}`,
                  }}
                >
                  <input
                    id={`modal-role-${r.value}`}
                    type="radio"
                    name="user-role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="accent-blue-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{r.label}</div>
                    <div className="text-xs" style={{ color: "#666" }}>
                      {r.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-medium"
              style={{ background: "#2a2a2a", color: "#aaa", border: "1px solid #333" }}
            >
              Cancel
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ background: loading ? "#1e3a8a" : "#1d4ed8" }}
            >
              {loading
                ? isCreate
                  ? "Creating…"
                  : "Saving…"
                : isCreate
                  ? "Create User"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
