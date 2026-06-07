"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/constants/routes";

import { Box, Typography, Chip } from "@mui/material";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

type NavItem = {
  name: string;
  href: string;
  badge?: number;
  icon: React.ReactNode;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

function getNavSections(role: string | undefined): NavSection[] {
  return [
    {
      label: "MAIN",
      items: [
        {
          name: "Dashboard",
          href: ROUTES.DASHBOARD.HOME,
          icon: <DashboardOutlinedIcon fontSize="small" />,
        },
        {
          name: "Products",
          href: ROUTES.DASHBOARD.PRODUCTS,
          icon: <Inventory2OutlinedIcon fontSize="small" />,
        },
      ],
    },
    {
      label: "TRANSACTIONS",
      items: [
        {
          name: "Receive Stock",
          href: ROUTES.DASHBOARD.STOCK.RECEIVE,
          icon: <DownloadOutlinedIcon fontSize="small" />,
        },
        {
          name: "Cut Stock",
          href: ROUTES.DASHBOARD.STOCK.CUT,
          icon: <ContentCutOutlinedIcon fontSize="small" />,
        },
        {
          name: "Movement Log",
          href: ROUTES.DASHBOARD.STOCK.HISTORY,
          icon: <HistoryOutlinedIcon fontSize="small" />,
        },
      ],
    },
    {
      label: "MONITOR",
      items: [
        {
          name: "Expiry",
          href: ROUTES.DASHBOARD.EXPIRY,
          badge: 25,
          icon: <AccessTimeOutlinedIcon fontSize="small" />,
        },
        {
          name: "Reports",
          href: ROUTES.DASHBOARD.REPORTS,
          icon: <AssessmentOutlinedIcon fontSize="small" />,
        },
      ],
    },
    ...(role === "OWNER"
      ? [
          {
            label: "ADMIN",
            items: [
              {
                name: "Users",
                href: ROUTES.DASHBOARD.USERS,
                icon: <PeopleOutlineOutlinedIcon fontSize="small" />,
              },
            ],
          },
        ]
      : []),
    {
      label: "SETTINGS",
      items: [
        {
          name: "Settings",
          href: ROUTES.DASHBOARD.SETTINGS,
          icon: <SettingsOutlinedIcon fontSize="small" />,
        },
      ],
    },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const navSections = getNavSections(session?.user?.role);

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD.HOME) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <Box
      sx={{
        width: 260,
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          S
        </Box>

        <Box>
          <Typography style={{ fontWeight: 700 }}>StockMS</Typography>

          <Typography variant="caption" color="text.secondary">
            Phase 1
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ p: 2, flex: 1 }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                mb: 1,
                display: "block",
                fontWeight: 700,
                letterSpacing: 1,
                color: "text.secondary",
              }}
            >
              {section.label}
            </Typography>

            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      mb: 0.5,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all .2s ease",

                      bgcolor: active ? "primary.50" : "transparent",

                      color: active ? "primary.main" : "text.secondary",

                      "&:hover": {
                        bgcolor: active ? "primary.50" : "action.hover",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      {Icon}

                      <Typography
                        variant="body2"
                        style={{
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>

                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color="error"
                        sx={{
                          height: 20,
                          fontSize: 11,
                        }}
                      />
                    )}
                  </Box>
                </Link>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
