export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: {
    HOME: "/dashboard",
    PRODUCTS: "/dashboard/products",
    STOCK: {
      RECEIVE: "/dashboard/stock/receive",
      CUT: "/dashboard/stock/cut",
      HISTORY: "/dashboard/stock/history",
    },
    EXPIRY: "/dashboard/expiry",
    REPORTS: "/dashboard/reports",
    USERS: "/dashboard/users",
    SETTINGS: "/dashboard/settings",
  },
} as const;
