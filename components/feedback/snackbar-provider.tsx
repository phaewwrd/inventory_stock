"use client";

import Alert, { type AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

const AUTO_HIDE_MS = 4000;

interface SnackbarMessage {
	severity: AlertColor;
	text: string;
}

interface SnackbarContextValue {
	show: (severity: AlertColor, text: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/**
 * App-wide feedback toasts. Mounted above the router in providers.tsx so a
 * toast triggered just before navigation survives the page change.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState<SnackbarMessage | null>(null);

	const show = useCallback((severity: AlertColor, text: string) => {
		setMessage({ severity, text });
		setOpen(true);
	}, []);

	const handleClose = useCallback((_event?: unknown, reason?: string) => {
		if (reason === "clickaway") return;
		setOpen(false);
	}, []);

	const value = useMemo<SnackbarContextValue>(() => ({ show }), [show]);

	return (
		<SnackbarContext.Provider value={value}>
			{children}
			<Snackbar
				open={open}
				autoHideDuration={AUTO_HIDE_MS}
				onClose={handleClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				{message ? (
					<Alert
						onClose={() => setOpen(false)}
						severity={message.severity}
						variant="filled"
						sx={{ width: "100%" }}
					>
						{message.text}
					</Alert>
				) : undefined}
			</Snackbar>
		</SnackbarContext.Provider>
	);
}

export function useSnackbar(): SnackbarContextValue {
	const context = useContext(SnackbarContext);
	if (!context) {
		throw new Error("useSnackbar must be used within a SnackbarProvider.");
	}
	return context;
}
