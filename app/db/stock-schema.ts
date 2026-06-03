import {
  pgTable,
  integer,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { productLots, products } from "./product-schema";
import { user } from "./auth-schema";


export const movementTypeEnum = pgEnum(
  "movement_type",
  [
    "receive",
    "issue",
    "adjustment",
  ]
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: text("id")
      .primaryKey(),

    productId: text("product_id")
      .references(() => products.id)
      .notNull(),

    lotId: text("lot_id")
      .references(() => productLots.id),

    movementType:
      movementTypeEnum(
        "movement_type"
      ).notNull(),

    quantity: integer("quantity")
      .notNull(),

    balanceAfter: integer(
      "balance_after"
    ).notNull(),

    remark: text("remark"),

    createdBy: text("created_by")
      .references(() => user.id),

    createdAt: timestamp(
      "created_at"
    )
      .defaultNow()
      .notNull(),
  }
);