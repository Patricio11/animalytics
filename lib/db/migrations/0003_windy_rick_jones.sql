CREATE TABLE "payment_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_key" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"icon" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false,
	"api_key" text,
	"secret_key" text,
	"webhook_secret" text,
	"webhook_url" text,
	"environment" text DEFAULT 'test' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"processing_fee_percent" integer DEFAULT 290,
	"processing_fee_fixed" integer DEFAULT 30,
	"supports_refunds" boolean DEFAULT true,
	"supports_partial_refunds" boolean DEFAULT true,
	"supports_recurring" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"last_tested_at" timestamp,
	"last_test_success" boolean,
	"last_test_error" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_providers_provider_key_unique" UNIQUE("provider_key")
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"standard_fee_percent" integer DEFAULT 500 NOT NULL,
	"premium_fee_percent" integer DEFAULT 300 NOT NULL,
	"minimum_fee" integer DEFAULT 100 NOT NULL,
	"maximum_fee" integer DEFAULT 50000 NOT NULL,
	"auto_release_days" integer DEFAULT 7 NOT NULL,
	"dispute_window_days" integer DEFAULT 14 NOT NULL,
	"minimum_withdrawal" integer DEFAULT 2500 NOT NULL,
	"withdrawal_processing_days" integer DEFAULT 3 NOT NULL,
	"default_currency" text DEFAULT 'USD' NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_settings_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" text NOT NULL,
	"field_changed" text,
	"old_value" text,
	"new_value" text,
	"changed_by" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"method_key" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"icon" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"processing_days" integer DEFAULT 3 NOT NULL,
	"processing_fee_percent" integer DEFAULT 0,
	"processing_fee_fixed" integer DEFAULT 0,
	"minimum_amount" integer DEFAULT 2500,
	"maximum_amount" integer,
	"supported_currencies" text[] DEFAULT '{"USD"}',
	"required_fields" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payout_methods_method_key_unique" UNIQUE("method_key")
);
--> statement-breakpoint
ALTER TABLE "payment_providers" ADD CONSTRAINT "payment_providers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_settings" ADD CONSTRAINT "payment_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_settings_audit" ADD CONSTRAINT "payment_settings_audit_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_methods" ADD CONSTRAINT "payout_methods_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;