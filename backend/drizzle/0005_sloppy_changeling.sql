CREATE TYPE "public"."telegram_connection_kind" AS ENUM('bot', 'account');--> statement-breakpoint
CREATE TABLE "telegram_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "telegram_connection_kind" NOT NULL,
	"telegram_id" text NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"encrypted_credentials" text NOT NULL,
	"verified_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "telegram_connections" ADD CONSTRAINT "telegram_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_connections_owner_identity" ON "telegram_connections" USING btree ("user_id","telegram_id");