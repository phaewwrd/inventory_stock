import { boolean, date, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  productname: text("productname").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),

  sku: text("sku").notNull().unique(),

  categoryId: text("category_id")
    .references(() => categories.id)
    .notNull(),

  name: text("name").notNull(),

  size: text("size"),   

  unit: text("unit").notNull(),

  latestCost: numeric("latest_cost", {
    precision: 12,
    scale: 2,
  }),

  minimumStock: integer("minimum_stock")
    .notNull()
    .default(0),

  isActive: boolean("is_active")
    .default(true)
    .notNull(),

  note: text("note"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

export const productLots = pgTable("product_lots", {
  id: text("id").primaryKey(),

  productId: text("product_id")
    .references(() => products.id)
    .notNull(),

  lotNo: text("lot_no").notNull(),

  expiryDate: date("expiry_date"),

  receivedDate: date("received_date")
    .notNull(),

  quantity: integer("quantity")
    .notNull(),

  remainingQty: integer("remaining_qty")
    .notNull(),

  unitCost: numeric("unit_cost", {
    precision: 12,
    scale: 2,
  }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});