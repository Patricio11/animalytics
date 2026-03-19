--> statement-breakpoint
CREATE TABLE "profile_boosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"duration_days" integer NOT NULL,
	"total_amount" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"wallet_transaction_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "breeder_profiles" ADD COLUMN "is_boosted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "breeder_profiles" ADD COLUMN "boosted_until" timestamp;--> statement-breakpoint
ALTER TABLE "profile_boosts" ADD CONSTRAINT "profile_boosts_profile_id_breeder_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."breeder_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_boosts" ADD CONSTRAINT "profile_boosts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
