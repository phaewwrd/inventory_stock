"use client";

import { useMemo, useState, useTransition } from "react";

import {
  assignRoleAction,
  toggleDisabledAction,
} from "@/features/users/actions";
import type { SerializedUser, UserRole } from "@/features/users/types";
import { RoleBadge } from "./role-badge";
import { UserModal } from "./user-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserTableProps {
  initialUsers: SerializedUser[];
}

const ALL_ROLES: { value: UserRole; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "STOCK_MANAGER", label: "Stock Manager" },
  { value: "STOCK_USER", label: "Stock User" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function Avatar({ name, disabled }: { name: string; disabled: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white select-none"
      style={{
        width: 36,
        height: 36,
        background: disabled ? "#374151" : "#1d4ed8",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StatusPill({ disabled }: { disabled: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        background: disabled ? "rgba(127,29,29,0.3)" : "rgba(22,101,52,0.3)",
        color: disabled ? "#ef4444" : "#4ade80",
        border: `1px solid ${disabled ? "#7f1d1d" : "#166534"}`,
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: 6,
          height: 6,
          background: disabled ? "#ef4444" : "#4ade80",
          display: "inline-block",
        }}
      />
      {disabled ? "Disabled" : "Active"}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState<SerializedUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<SerializedUser | null>(null);
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();

  // ── Derived data ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ── Modal handlers ──────────────────────────────────────────────────────────

  function openCreate() {
    setModalMode("create");
    setEditingUser(null);
    setShowModal(true);
  }

  function openEdit(u: SerializedUser) {
    setModalMode("edit");
    setEditingUser(u);
    setShowModal(true);
  }

  // After create, reload to get fresh RSC data
  function handleModalSuccess() {
    window.location.reload();
  }

  // ── Inline actions ──────────────────────────────────────────────────────────

  function handleToggleDisabled(u: SerializedUser) {
    setActionError("");
    startTransition(async () => {
      const result = await toggleDisabledAction(u.id, !u.disabled);
      if (result.success) {
        setUsers((prev) =>
          prev.map((x) =>
            x.id === u.id ? { ...x, disabled: !u.disabled } : x,
          ),
        );
      } else {
        setActionError(result.error);
      }
    });
  }

  function handleRoleChange(u: SerializedUser, newRole: UserRole) {
    setActionError("");
    startTransition(async () => {
      const result = await assignRoleAction(u.id, newRole);
      if (result.success) {
        setUsers((prev) =>
          prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)),
        );
      } else {
        setActionError(result.error);
      }
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Modal */}
      {showModal && (
        <UserModal
          mode={modalMode}
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Inline action error */}
      {actionError && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(127,29,29,0.35)",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
          }}
        >
          {actionError}
          <button
            type="button"
            className="ml-3 underline text-xs opacity-70"
            onClick={() => setActionError("")}
          >
            dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <input
          id="user-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="rounded-xl px-4 py-2 text-sm outline-none"
          style={{
            flex: "1 1 220px",
            maxWidth: 300,
            background: "#1a1a1a",
            border: "1px solid #2e2e2e",
            color: "#ccc",
          }}
        />

        {/* Role filter */}
        <div className="flex items-center gap-1">
          {(["ALL", "OWNER", "STOCK_MANAGER", "STOCK_USER"] as const).map(
            (r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background:
                    roleFilter === r ? "#1d4ed8" : "#1a1a1a",
                  color: roleFilter === r ? "#fff" : "#666",
                  border: `1px solid ${roleFilter === r ? "#1d4ed8" : "#2e2e2e"}`,
                }}
              >
                {r === "ALL"
                  ? "All"
                  : r === "OWNER"
                    ? "Owner"
                    : r === "STOCK_MANAGER"
                      ? "Manager"
                      : "User"}
              </button>
            ),
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Create button */}
        <button
          id="create-user-btn"
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#1d4ed8" }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>
          Create User
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #2e2e2e" }}
      >
        <table
          className="w-full"
          style={{ borderCollapse: "collapse", background: "#1e1e1e" }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #2e2e2e", background: "#222" }}>
              {[
                "User",
                "Email",
                "Role",
                "Status",
                "Joined",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold tracking-wider"
                  style={{ color: "#4e4e4e" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-16 text-sm"
                  style={{ color: "#444" }}
                >
                  {search || roleFilter !== "ALL"
                    ? "No users match your filter."
                    : "No users yet. Create the first one."}
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid #252525" }}
                  className="group transition-colors"
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#252525")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "")
                  }
                >
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} disabled={u.disabled} />
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: u.disabled ? "#555" : "#e5e5e5" }}
                        >
                          {u.name}
                        </div>
                        <div className="text-xs" style={{ color: "#444" }}>
                          ID: {u.id.slice(0, 8)}…
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td
                    className="px-5 py-3.5 text-sm"
                    style={{ color: "#777" }}
                  >
                    {u.email}
                  </td>

                  {/* Role – inline dropdown */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                      <select
                        aria-label={`Change role for ${u.name}`}
                        value={u.role}
                        disabled={isPending}
                        onChange={(e) =>
                          handleRoleChange(u, e.target.value as UserRole)
                        }
                        className="rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                        style={{
                          background: "#1a1a1a",
                          border: "1px solid #2e2e2e",
                          color: "#666",
                        }}
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusPill disabled={u.disabled} />
                  </td>

                  {/* Joined */}
                  <td
                    className="px-5 py-3.5 text-sm"
                    style={{ color: "#555" }}
                  >
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        id={`edit-user-${u.id}`}
                        type="button"
                        onClick={() => openEdit(u)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{
                          background: "#2a2a2a",
                          color: "#ccc",
                          border: "1px solid #333",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        id={`toggle-user-${u.id}`}
                        type="button"
                        onClick={() => handleToggleDisabled(u)}
                        disabled={isPending}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors"
                        style={{
                          background: u.disabled
                            ? "rgba(22,101,52,0.2)"
                            : "rgba(127,29,29,0.2)",
                          color: u.disabled ? "#4ade80" : "#f87171",
                          border: `1px solid ${u.disabled ? "#166534" : "#7f1d1d"}`,
                        }}
                      >
                        {isPending ? "…" : u.disabled ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="mt-3 text-xs" style={{ color: "#3e3e3e" }}>
        Showing{" "}
        <span style={{ color: "#666" }}>{filtered.length}</span> of{" "}
        <span style={{ color: "#666" }}>{users.length}</span> users
      </div>
    </>
  );
}
