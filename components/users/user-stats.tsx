import type { ReactNode } from "react";
import type { SerializedUser } from "@/features/users/types";

import { Box, Card, Grid, Typography } from "@mui/material";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

interface UserStatsProps {
  users: SerializedUser[];
}

type StatCard = {
  label: string;
  value: number;
  bg: string;
  valueColor: string;
  sub: string;
  icon: ReactNode;
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
      bg: "#2563eb",
      valueColor: "#2563eb",
      sub: "All accounts",
      icon: <PeopleAltOutlinedIcon />,
    },
    {
      label: "Active",
      value: active,
      bg: "#16a34a",
      valueColor: "#16a34a",
      sub: "Can sign in",
      icon: <CheckCircleOutlineIcon />,
    },
    {
      label: "Disabled",
      value: disabled,
      bg: "#dc2626",
      valueColor: "#dc2626",
      sub: "Access revoked",
      icon: <BlockOutlinedIcon />,
    },
    {
      label: "Managers",
      value: managers,
      bg: "#7c3aed",
      valueColor: "#7c3aed",
      sub: `${owners} owner${owners !== 1 ? "s" : ""}`,
      icon: <AdminPanelSettingsOutlinedIcon />,
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid
          key={card.label}
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              transition: "all 0.2s ease-in-out",

              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: `${card.bg}15`,
                color: card.bg,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                mb: 2,

                "& svg": {
                  fontSize: 28,
                },
              }}
            >
              {card.icon}
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: card.valueColor,
                mb: 0.5,
              }}
            >
              {card.value}
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {card.label}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {card.sub}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
