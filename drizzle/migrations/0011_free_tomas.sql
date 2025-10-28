CREATE TYPE "public"."notification_category" AS ENUM('breeding', 'health', 'financial', 'marketplace', 'system', 'social');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('progesterone_test_due', 'progesterone_daily_test', 'breeding_window_open', 'breeding_window_closing', 'ovulation_detected', 'whelping_approaching', 'heat_cycle_started', 'breeding_scheduled', 'breeding_completed', 'pregnancy_confirmed', 'ultrasound_due', 'whelping_started', 'puppy_born', 'litter_registered', 'vaccination_due', 'deworming_due', 'vet_appointment', 'health_check_due', 'medication_reminder', 'listing_approved', 'listing_rejected', 'listing_expired', 'inquiry_received', 'offer_received', 'sale_completed', 'payment_received', 'payment_due', 'invoice_generated', 'wallet_low_balance', 'kyc_approved', 'kyc_rejected', 'kyc_pending_review', 'subscription_expiring', 'subscription_renewed', 'account_verified', 'new_follower', 'review_received', 'message_received', 'event_reminder', 'system_announcement', 'feature_update', 'maintenance_scheduled');--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"enable_in_app" boolean DEFAULT true NOT NULL,
	"enable_email" boolean DEFAULT true NOT NULL,
	"enable_sms" boolean DEFAULT false NOT NULL,
	"enable_push" boolean DEFAULT false NOT NULL,
	"category_preferences" text,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"enable_daily_digest" boolean DEFAULT false NOT NULL,
	"daily_digest_time" text,
	"enable_weekly_digest" boolean DEFAULT false NOT NULL,
	"weekly_digest_day" text,
	"weekly_digest_time" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"category" "notification_category" NOT NULL,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"title_template" text NOT NULL,
	"message_template" text NOT NULL,
	"icon" text,
	"icon_color" text,
	"action_url_template" text,
	"action_label" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"category" "notification_category" NOT NULL,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"action_url" text,
	"action_label" text,
	"related_entity_type" text,
	"related_entity_id" text,
	"icon" text,
	"icon_color" text,
	"read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"archived" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;