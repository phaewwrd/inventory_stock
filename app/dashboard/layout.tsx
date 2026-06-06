import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#1a1a1a", color: "#e5e5e5" }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
