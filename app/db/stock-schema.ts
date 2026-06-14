import {
	date,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { productLots, products } from "./product-schema";

export const movementTypeEnum = pgEnum("movement_type", [
	"receive",
	"issue",
	"adjustment",
]);

export const movementStatusEnum = pgEnum("movement_status", [
	"pending",
	"approved",
	"unapproved",
]);

export const stockMovements = pgTable("stock_movements", {
	id: text("id").primaryKey(),

	productId: text("product_id")
		.references(() => products.id)
		.notNull(),

	lotId: text("lot_id").references(() => productLots.id),

	movementType: movementTypeEnum("movement_type").notNull(),

	quantity: integer("quantity").notNull(),

	// Null while pending; set to the post-application balance on approval.
	balanceAfter: integer("balance_after"),

	remark: text("remark"),

	status: movementStatusEnum("status").notNull().default("pending"),

	// Requested lot details — materialized into product_lots on approval.
	reqLotNo: text("req_lot_no"),

	reqExpiryDate: date("req_expiry_date"),

	reqUnitCost: numeric("req_unit_cost", { precision: 12, scale: 2 }),

	referenceNo: text("reference_no"),

	// Generic categorization: "Source" for receive, "Reason" for cut.
	reason: text("reason"),

	createdBy: text("created_by").references(() => user.id),

	// Review audit — who approved/rejected and when.
	reviewedBy: text("reviewed_by").references(() => user.id),

	reviewedAt: timestamp("reviewed_at"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
});