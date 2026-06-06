
export function NavTab({
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