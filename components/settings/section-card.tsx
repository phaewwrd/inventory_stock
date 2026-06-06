export function SectionCard({
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

