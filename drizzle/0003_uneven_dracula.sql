CREATE INDEX "product_lots_product_expiry_idx" ON "product_lots" USING btree ("product_id","expiry_date");--> statement-breakpoint
CREATE INDEX "products_name_idx" ON "products" USING btree ("name");