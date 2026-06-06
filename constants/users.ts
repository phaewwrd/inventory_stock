import { UserRole } from "@/features/users/types";

export const ROLES: { value: UserRole; label: string; desc: string }[] = [
    { value: "OWNER", label: "Owner", desc: "Full system access" },
    { value: "STOCK_MANAGER", label: "Stock Manager", desc: "Manage stock & reports" },
    { value: "STOCK_USER", label: "Stock User", desc: "View & basic transactions" },
];