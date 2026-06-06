import { authClient } from "@/lib/auth-client";
import { Feedback, FeedbackState } from "./feedback";
import { Field } from "../field";
import { inputStyle } from "../input-style";
import { SectionCard } from "./section-card";
import { useState, useTransition } from "react";
import { SaveButton } from "./save-btn";

export function EmailSection({ currentEmail }: { currentEmail: string }) {
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