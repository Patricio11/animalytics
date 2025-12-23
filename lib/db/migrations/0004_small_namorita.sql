ALTER TYPE "public"."event_type" ADD VALUE 'pregnancy_ultrasound' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'pregnancy_blood_test' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'pregnancy_xray' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."event_type" ADD VALUE 'pregnancy_checkup' BEFORE 'other';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'progesterone_next_cycle' BEFORE 'breeding_window_open';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'heat_cycle_completed' BEFORE 'breeding_scheduled';--> statement-breakpoint
CREATE TABLE "breeder_delivery_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"breeder_id" text NOT NULL,
	"offers_pickup" boolean DEFAULT true NOT NULL,
	"offers_local_delivery" boolean DEFAULT false NOT NULL,
	"offers_shipping" boolean DEFAULT false NOT NULL,
	"pickup_location" text,
	"pickup_instructions" text,
	"local_delivery_fee" integer DEFAULT 0,
	"local_delivery_notes" text,
	"local_delivery_estimated_days" integer DEFAULT 1,
	"shipping_fee" integer DEFAULT 0,
	"shipping_fee_international" integer,
	"shipping_estimated_days" integer DEFAULT 3,
	"shipping_notes" text,
	"delivery_policy" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "breeder_delivery_settings_breeder_id_unique" UNIQUE("breeder_id")
);
--> statement-breakpoint
CREATE TABLE "listing_delivery_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"breeder_id" text NOT NULL,
	"custom_local_delivery_fee" integer,
	"custom_shipping_fee" integer,
	"custom_shipping_fee_international" integer,
	"delivery_included" boolean DEFAULT false,
	"shipping_included" boolean DEFAULT false,
	"pickup_only" boolean DEFAULT false,
	"special_delivery_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "listing_delivery_overrides_listing_id_unique" UNIQUE("listing_id")
);
--> statement-breakpoint
CREATE TABLE "veterinary_clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"clinic_name" text NOT NULL,
	"veterinarian_name" text,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"services" text,
	"specializations" text,
	"operating_hours" text,
	"emergency_available" boolean DEFAULT false,
	"emergency_phone" text,
	"is_primary" boolean DEFAULT false,
	"is_favorite" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."listing_category";--> statement-breakpoint
CREATE TYPE "public"."listing_category" AS ENUM('dog_for_sale', 'pups_for_sale', 'frozen_semen', 'stud_dog', 'other');--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "category" SET DATA TYPE "public"."listing_category" USING "category"::"public"."listing_category";--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "dnd_profile_number" text;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "veterinarian_email" text;--> statement-breakpoint
ALTER TABLE "health_records" ADD COLUMN "veterinarian_phone" text;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "is_last_mating" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "pregnancy_screening_tasks_generated" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "pregnancy_screening_tasks_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "heat_cycles" ADD COLUMN "next_expected_cycle_date" date;--> statement-breakpoint
ALTER TABLE "heat_cycles" ADD COLUMN "next_cycle_reminder_sent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "requires_approval" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "rejected_by" text;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "delivery_fee" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "breeder_delivery_settings" ADD CONSTRAINT "breeder_delivery_settings_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_delivery_overrides" ADD CONSTRAINT "listing_delivery_overrides_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "veterinary_clinics" ADD CONSTRAINT "veterinary_clinics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;