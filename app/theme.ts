"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    semantic: {
      primaryBg: string;
      successBg: string;
      successText: string;
      warningBg: string;
      warningText: string;
      dangerBg: string;
      dangerText: string;
      surface2: string;
      border: string;
      borderStrong: string;
      textTertiary: string;
    };
    layout: {
      sidebarWidth: number;
      topbarHeight: number;
    };
  }
  interface PaletteOptions {
    semantic?: Partial<Palette["semantic"]>;
    layout?: Partial<Palette["layout"]>;
  }
}

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#22C55E",
      contrastText: "#FFFFFF",
    },
    warning: {
      main: "#F59E0B",
      contrastText: "#0B0F14",
    },
    error: {
      main: "#EF4444",
      contrastText: "#FFFFFF",
    },
    info: {
      main: "#3B82F6",
    },
    background: {
      default: "#1A1A1A",
      paper: "#272727",
    },
    text: {
      primary: "#E5E5E5",
      secondary: "#A1A1A1",
    },
    divider: "#2E2E2E",
    semantic: {
      primaryBg: "rgba(59, 130, 246, 0.15)",
      successBg: "rgba(34, 197, 94, 0.15)",
      successText: "#4ADE80",
      warningBg: "rgba(245, 158, 11, 0.15)",
      warningText: "#FBBF24",
      dangerBg: "rgba(239, 68, 68, 0.15)",
      dangerText: "#F87171",
      surface2: "#1F1F1F",
      border: "#2E2E2E",
      borderStrong: "#3A3A3A",
      textTertiary: "#777777",
    },
    layout: {
      sidebarWidth: 260,
      topbarHeight: 64,
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontSize: 32, fontWeight: 600, lineHeight: 1.2 },
    h2: { fontSize: 28, fontWeight: 600, lineHeight: 1.2 },
    h3: { fontSize: 22, fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: 18, fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: 16, fontWeight: 500, lineHeight: 1.4 },
    subtitle1: { fontSize: 16, fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: 14, fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4 },
    overline: {
      fontSize: 11,
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    button: {
      fontWeight: 500,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
        sizeSmall: { height: 32, padding: "0 12px" },
        sizeMedium: { height: 38, padding: "0 16px" },
        sizeLarge: { height: 44, padding: "0 20px" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#272727",
          border: "1px solid #2E2E2E",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9999, fontWeight: 500, fontSize: 11 },
        sizeSmall: { height: 22 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#1F1F1F",
        },
        notchedOutline: {
          borderColor: "#3A3A3A",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: 13, fontWeight: 500, color: "#A1A1A1" },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1A",
          borderBottom: "1px solid #2E2E2E",
          backgroundImage: "none",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            color: "#60A5FA",
            "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.22)" },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: 12, backgroundColor: "#0B0F14" },
      },
    },
  },
});
