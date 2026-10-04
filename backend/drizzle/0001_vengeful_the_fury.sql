CREATE TABLE "platform_integrations" (
	"provider" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"encrypted_secret" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform_integrations" ADD CONSTRAINT "platform_integrations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;