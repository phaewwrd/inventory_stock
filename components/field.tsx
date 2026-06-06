export function Field({
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