ALTER TABLE "stock_movements" ALTER COLUMN "balance_after" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "req_lot_no" text;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "req_expiry_date" date;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "req_unit_cost" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "reference_no" text;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "reason" text;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;