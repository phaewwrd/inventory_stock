
export interface FeedbackState {
    type: "success" | "error";
    message: string;
}

export function Feedback({ state }: { state: FeedbackState | null }) {
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