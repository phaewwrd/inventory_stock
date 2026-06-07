import { Stack } from "@mui/material";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack
      spacing={2}
      sx={{
        height: "100%",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      {children}
    </Stack>
  );
}
