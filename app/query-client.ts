import { QueryClient } from "@tanstack/react-query";

// Singleton pattern — one instance shared across the client app.
// Do NOT create this inside a component or hook, as that would create a new
// client on every render.
let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Reports are fetched on-demand; 5 min stale time avoids redundant
				// refetches when the user navigates between tabs or windows.
				staleTime: 5 * 60 * 1000,
				// Retry once on failure before surfacing an error state.
				retry: 1,
				// Don't refetch on window focus for report pages (they require
				// explicit filter application).
				refetchOnWindowFocus: false,
			},
		},
	});
}

export function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always create a new client so state is never shared between requests.
		return makeQueryClient();
	}
	// Browser: use a singleton so state is preserved across navigations.
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}
