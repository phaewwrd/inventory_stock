"use client";

import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

// ─── Types ─────────────────────────────────────────────────────────────────

type Section = "profile" | "email" | "password";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

// ─── Reusable sub-components ───────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#272727", border: "1px solid #2e2e2e" }}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs mt-0.5" style={{ color: "#666" }}>
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid #2e2e2e",
  color: "#e5e5e5",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  outline: "none",
  width: "100%",
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium" style={{ color: "#888" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Feedback({ state }: { state: FeedbackState | null }) {
  if (!state) return null;
  const isSuccess = state.type === "success";
  return (
    <div
      className="rounded-xl px-4 py-3 text-sm"
      style={{
        background: isSuccess ? "rgba(22,101,52,0.3)" : "rgba(127,29,29,0.35)",
        border: `1px solid ${isSuccess ? "#166534" : "#7f1d1d"}`,
        color: isSuccess ? "#4ade80" : "#fca5a5",
      }}
    >
      {state.message}
    </div>
  );
}

function SaveButton({
  loading,
  label = "Save changes",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
      style={{ background: loading ? "#1e3a8a" : "#1d4ed8" }}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

// ─── Profile Section (name only) ──────────────────────────────────────────

function ProfileSection({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setFeedback(null);

    startTransition(async () => {
      const { error } = await authClient.updateUser({ name: trimmed });
      if (error) {
        setFeedback({ type: "error", message: error.message ?? "Failed to update name." });
      } else {
        setFeedback({ type: "success", message: "Display name updated." });
      }
    });
  }

  return (
    <SectionCard
      title="Profile"
      subtitle="Update your display name visible across the system"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Feedback state={feedback} />

        <Field id="settings-name" label="Display Name">
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="Your full name"
            style={inputStyle}
          />
        </Field>

        <div className="flex justify-end">
          <SaveButton loading={isPending} />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Email Section ────────────────────────────────────────────────────────

function EmailSection({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || trimmed === currentEmail.toLowerCase()) {
      setFeedback({ type: "error", message: "Please enter a different email address." });
      return;
    }
    setFeedback(null);

    startTransition(async () => {
      const { error } = await authClient.changeEmail({
        newEmail: trimmed,
        callbackURL: "/dashboard/settings",
      });
      if (error) {
        setFeedback({ type: "error", message: error.message ?? "Failed to change email." });
      } else {
        setFeedback({
          type: "success",
          message: "Email updated successfully.",
        });
      }
    });
  }

  return (
    <SectionCard
      title="Email Address"
      subtitle="Change the email used to sign in to your account"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Feedback state={feedback} />

        <Field id="settings-email" label="Email Address">
          <input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </Field>

        <div
          className="rounded-xl px-4 py-3 text-xs"
          style={{
            background: "rgba(29,78,216,0.12)",
            border: "1px solid rgba(29,78,216,0.3)",
            color: "#93c5fd",
          }}
        >
          Your email is used to sign in. Changes take effect immediately for this internal system.
        </div>

        <div className="flex justify-end">
          <SaveButton loading={isPending} label="Update Email" />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Password Section ─────────────────────────────────────────────────────

/**
 * better-auth changePassword rules:
 *   - currentPassword is required (cannot change without verifying identity)
 *   - newPassword must be ≥ 8 characters (better-auth default minimum)
 *   - revokeOtherSessions: true signs the user out of all other devices
 */
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeOthers, setRevokeOthers] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 8) {
      setFeedback({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (newPassword === currentPassword) {
      setFeedback({ type: "error", message: "New password must differ from the current one." });
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOthers,
      });

      if (error) {
        setFeedback({ type: "error", message: error.message ?? "Failed to change password." });
      } else {
        setFeedback({ type: "success", message: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  /** Password strength indicator */
  function strength(pw: string) {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: "Weak", color: "#ef4444", w: "20%" };
    if (score <= 2) return { label: "Fair", color: "#f59e0b", w: "40%" };
    if (score <= 3) return { label: "Good", color: "#3b82f6", w: "60%" };
    if (score <= 4) return { label: "Strong", color: "#22c55e", w: "80%" };
    return { label: "Very strong", color: "#4ade80", w: "100%" };
  }

  const str = strength(newPassword);

  return (
    <SectionCard
      title="Password"
      subtitle="better-auth requirement: current password required · minimum 8 characters"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Feedback state={feedback} />

        <Field id="settings-current-password" label="Current Password">
          <input
            id="settings-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={inputStyle}
          />
        </Field>

        <Field id="settings-new-password" label="New Password">
          <input
            id="settings-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            style={inputStyle}
          />
          {/* Strength bar */}
          {str && (
            <div className="mt-1.5">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "#1a1a1a" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: str.w, background: str.color }}
                />
              </div>
              <span className="text-xs mt-1 block" style={{ color: str.color }}>
                {str.label}
              </span>
            </div>
          )}
        </Field>

        <Field id="settings-confirm-password" label="Confirm New Password">
          <input
            id="settings-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            style={{
              ...inputStyle,
              borderColor:
                confirmPassword && confirmPassword !== newPassword
                  ? "#7f1d1d"
                  : "#2e2e2e",
            }}
          />
          {confirmPassword && confirmPassword !== newPassword && (
            <span className="text-xs" style={{ color: "#f87171" }}>
              Passwords do not match
            </span>
          )}
        </Field>

        {/* Revoke sessions toggle */}
        <label
          htmlFor="settings-revoke-sessions"
          className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
          style={{ background: "#1a1a1a", border: "1px solid #2e2e2e" }}
        >
          <input
            id="settings-revoke-sessions"
            type="checkbox"
            checked={revokeOthers}
            onChange={(e) => setRevokeOthers(e.target.checked)}
            className="accent-blue-600"
            style={{ width: 16, height: 16 }}
          />
          <div>
            <div className="text-sm font-medium text-white">
              Sign out other devices
            </div>
            <div className="text-xs" style={{ color: "#555" }}>
              Revoke all active sessions except this one (recommended)
            </div>
          </div>
        </label>

        <div className="flex justify-end">
          <SaveButton loading={isPending} label="Change Password" />
        </div>
      </form>
    </SectionCard>
  );
}

// ─── Danger Zone ──────────────────────────────────────────────────────────

// function DangerZone() {
//   return (
//     <div
//       className="rounded-2xl p-6"
//       style={{ background: "#1e1e1e", border: "1px solid #3a1010" }}
//     >
//       <div className="mb-4">
//         <h2 className="text-base font-semibold" style={{ color: "#ef4444" }}>
//           Danger Zone
//         </h2>
//         <p className="text-xs mt-0.5" style={{ color: "#666" }}>
//           Irreversible account actions. Contact an OWNER to delete your account.
//         </p>
//       </div>
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-sm text-white font-medium">Sign out of all devices</div>
//           <div className="text-xs mt-0.5" style={{ color: "#555" }}>
//             Revokes every active session, including this one
//           </div>
//         </div>
//         <button
//           type="button"
//           id="settings-signout-all"
//           onClick={async () => {
//             await authClient.signOut();
//             window.location.href = "/login";
//           }}
//           className="rounded-xl px-4 py-2 text-sm font-medium"
//           style={{
//             background: "rgba(127,29,29,0.25)",
//             color: "#f87171",
//             border: "1px solid #7f1d1d",
//           }}
//         >
//           Sign out all
//         </button>
//       </div>
//     </div>
//   );
// }

// ─── Nav Tab ──────────────────────────────────────────────────────────────

function NavTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
      style={
        active
          ? { background: "#1d4ed8", color: "#fff", fontWeight: 500 }
          : { color: "#666" }
      }
    >
      <span
        className="shrink-0 rounded"
        style={{
          width: 14,
          height: 14,
          border: `1.5px solid ${active ? "#93c5fd" : "#3a3a3a"}`,
          display: "inline-block",
        }}
      />
      {label}
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────

interface SettingsFormProps {
  userName: string;
  userEmail: string;
  userInitial: string;
  userRole: string;
}

export function SettingsForm({
  userName,
  userEmail,
  userInitial,
  userRole,
}: SettingsFormProps) {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  return (
    <div className="flex gap-6">
      {/* Left nav */}
      <aside className="shrink-0 w-48 flex flex-col gap-1">
        <p className="px-3 mb-2 text-xs font-semibold tracking-widest" style={{ color: "#444" }}>
          ACCOUNT
        </p>
        <NavTab
          label="Profile"
          active={activeSection === "profile"}
          onClick={() => setActiveSection("profile")}
        />
        <NavTab
          label="Email"
          active={activeSection === "email"}
          onClick={() => setActiveSection("email")}
        />
        <NavTab
          label="Password"
          active={activeSection === "password"}
          onClick={() => setActiveSection("password")}
        />
      </aside>

      {/* Right content */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* User identity card */}
        <div
          className="flex items-center gap-4 rounded-2xl px-5 py-4"
          style={{ background: "#272727", border: "1px solid #2e2e2e" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ width: 48, height: 48, background: "#1d4ed8" }}
          >
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-white truncate">{userName}</div>
            <div className="text-sm truncate" style={{ color: "#666" }}>{userEmail}</div>
          </div>
          <span
            className="ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "rgba(29,78,216,0.2)",
              color: "#93c5fd",
              border: "1px solid rgba(29,78,216,0.4)",
            }}
          >
            {userRole}
          </span>
        </div>

        {/* Active section */}
        {activeSection === "profile" && (
          <ProfileSection currentName={userName} />
        )}
        {activeSection === "email" && (
          <EmailSection currentEmail={userEmail} />
        )}
        {activeSection === "password" && <PasswordSection />}

        {/* Danger zone always visible */}
        {/* <DangerZone /> */}
      </div>
    </div>
  );
}
