import type { SerializedUser } from "@/features/users/types";
import { Box, Card, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

interface UserStatsProps {
  users: SerializedUser[];
}

type StatCard = {
  label: string;
  value: number;
  bg: string;
  valueColor: string;
  sub: string;
};

export function UserStats({ users }: UserStatsProps) {
  const total = users.length;
  const active = users.filter((u) => !u.disabled).length;
  const disabled = users.filter((u) => u.disabled).length;
  const owners = users.filter((u) => u.role === "OWNER").length;
  const managers = users.filter((u) => u.role === "STOCK_MANAGER").length;

  const cards: StatCard[] = [
    {
      label: "Total Users",
      value: total,
      bg: "#1d4ed8",
      valueColor: "#ffffff",
      sub: "All accounts",
    },
    {
      label: "Active",
      value: active,
      bg: "#166534",
      valueColor: "#4ade80",
      sub: "Can sign in",
    },
    {
      label: "Disabled",
      value: disabled,
      bg: "#7f1d1d",
      valueColor: "#ef4444",
      sub: "Access revoked",
    },
    {
      label: "Managers",
      value: managers,
      bg: "#5b21b6",
      valueColor: "#c4b5fd",
      sub: `${owners} owner${owners !== 1 ? "s" : ""}`,
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                backgroundColor: card.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(255,255,255,0.55)",
                  borderRadius: 0.5,
                }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {card.value}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {card.label}
            </Typography>

            <Typography variant="caption" sx={{ color: "#888" }}>
              {card.sub}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
