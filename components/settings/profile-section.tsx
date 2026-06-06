import { authClient } from "@/lib/auth-client";
import { useState, useTransition } from "react";
import { SectionCard } from "./section-card";
import { Feedback, FeedbackState } from "./feedback";
import { Field } from "./field";
import { inputStyle } from "./input-style";
import { SaveButton } from "./save-btn";

export function ProfileSection({ currentName }: { currentName: string }) {
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