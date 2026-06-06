export function SaveButton({
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