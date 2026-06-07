import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import Stack from "@mui/material/Stack";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        {children}
      </div>
    </Stack>
  );
}
