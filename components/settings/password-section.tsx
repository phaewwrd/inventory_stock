import { authClient } from "@/lib/auth-client";
import { useState, useTransition } from "react";
import { SectionCard } from "./section-card";
import { Feedback, FeedbackState } from "./feedback";
import { Field } from "../field";
import { inputStyle } from "../input-style";
import { SaveButton } from "./save-btn";

export function PasswordSection() {
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