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
		mode: "light",
		primary: {
			main: "#185FA5",
			light: "#378ADD",
			contrastText: "#FFFFFF",
		},
		success: {
			main: "#639922",
			contrastText: "#FFFFFF",
		},
		warning: {
			main: "#BA7517",
			contrastText: "#FFFFFF",
		},
		error: {
			main: "#E24B4A",
			contrastText: "#FFFFFF",
		},
		info: {
			main: "#185FA5",
		},
		background: {
			default: "#F6F7F9",
			paper: "#FFFFFF",
		},
		text: {
			primary: "#121720",
			secondary: "#59616F",
		},
		divider: "#E5E8ED",
		semantic: {
			primaryBg: "#E6F1FB",
			successBg: "#EAF3DE",
			successText: "#3B6D11",
			warningBg: "#FAEEDA",
			warningText: "#854F0B",
			dangerBg: "#FCEBEB",
			dangerText: "#A32D2D",
			surface2: "#F5F6F8",
			border: "#E5E8ED",
			borderStrong: "#D4D8DF",
			textTertiary: "#8A919E",
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
					border: "1px solid #E5E8ED",
				},
			},
		},
		MuiPaper: {
			defaultProps: { elevation: 0 },
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
					backgroundColor: "#FFFFFF",
				},
				notchedOutline: {
					borderColor: "#D4D8DF",
				},
			},
		},
		MuiInputLabel: {
			styleOverrides: {
				root: { fontSize: 13, fontWeight: 500, color: "#59616F" },
			},
		},
		MuiAppBar: {
			defaultProps: { elevation: 0, color: "inherit" },
			styleOverrides: {
				root: {
					backgroundColor: "#FFFFFF",
					borderBottom: "1px solid #E5E8ED",
				},
			},
		},
		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					"&.Mui-selected": {
						backgroundColor: "#E6F1FB",
						color: "#185FA5",
						"&:hover": { backgroundColor: "#E6F1FB" },
					},
				},
			},
		},
		MuiTooltip: {
			styleOverrides: {
				tooltip: { fontSize: 12, backgroundColor: "#121720" },
			},
		},
	},
});
