CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_key" text NOT NULL,
	"owner_user_id" uuid,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"current_price_cents" integer NOT NULL,
	"original_price_cents" integer,
	"discount_percentage" integer DEFAULT 0 NOT NULL,
	"category" text,
	"image_url" text,
	"product_url" text NOT NULL,
	"affiliate_url" text NOT NULL,
	"shop_name" text,
	"valid_until" timestamp with time zone,
	"fetched_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "offers_scope_source_external_unique" ON "offers" USING btree ("scope_key","source","external_id");--> statement-breakpoint
CREATE INDEX "offers_owner_user_id_idx" ON "offers" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "offers_fetched_at_idx" ON "offers" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "offers_source_idx" ON "offers" USING btree ("source");