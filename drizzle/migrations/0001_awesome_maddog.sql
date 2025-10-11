CREATE TYPE "public"."file_type" AS ENUM('image', 'video', 'document');--> statement-breakpoint
CREATE TYPE "public"."photo_category" AS ENUM('profile', 'training', 'shows', 'pedigree', 'health', 'shelter', 'baby_photos');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('vaccination', 'deworming', 'vet_checkup', 'grooming', 'medication', 'heat_cycle', 'breeding', 'custom');--> statement-breakpoint
CREATE TYPE "public"."semen_type" AS ENUM('fresh', 'chilled', 'frozen');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."breeding_method" AS ENUM('natural_ai', 'tci', 'surgical_ai', 'frozen');--> statement-breakpoint
CREATE TYPE "public"."laboratory" AS ENUM('VIDAS', 'IDEXX');--> statement-breakpoint
CREATE TYPE "public"."mating_status" AS ENUM('planned', 'confirmed', 'unsuccessful', 'resulted_in_litter');--> statement-breakpoint
CREATE TYPE "public"."unit" AS ENUM('nanograms', 'nanomoles');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('vet_visit', 'vaccination', 'worming', 'heartworm', 'flea_tick', 'rugging', 'pest_management', 'other');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'completed', 'skipped', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('feeding', 'exercise', 'grooming', 'weight', 'cleaning', 'event', 'puppy_feeding', 'misc');--> statement-breakpoint
CREATE TYPE "public"."export_format" AS ENUM('csv', 'pdf', 'excel', 'json');--> statement-breakpoint
CREATE TYPE "public"."export_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('events', 'feeding', 'exercise', 'grooming', 'cleaning', 'puppies', 'mating_history');--> statement-breakpoint
CREATE TYPE "public"."featured_tier" AS ENUM('none', 'basic', 'premium', 'spotlight');--> statement-breakpoint
CREATE TYPE "public"."listing_category" AS ENUM('dog_for_sale', 'pups_for_sale', 'reproductive_services', 'frozen_semen', 'stud_dog');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'pending', 'sold', 'expired', 'removed');--> statement-breakpoint
CREATE TABLE "animal_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"document_type" text NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"expiry_date" date,
	"notes" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "animal_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"category" "photo_category" NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"file_name" text NOT NULL,
	"file_size" integer,
	"width" integer,
	"height" integer,
	"caption" text,
	"display_order" integer DEFAULT 0,
	"is_primary" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "animal_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reminder_type" "reminder_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"reminder_date" date,
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"recurrence_interval" integer,
	"recurrence_end_date" date,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"send_email" boolean DEFAULT true,
	"send_push" boolean DEFAULT true,
	"send_sms" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "animal_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"owner_id" text NOT NULL,
	"shared_with_user_id" text NOT NULL,
	"access_level" text NOT NULL,
	"share_type" text,
	"can_view_health" boolean DEFAULT true,
	"can_edit_health" boolean DEFAULT false,
	"can_view_breeding" boolean DEFAULT false,
	"can_edit_breeding" boolean DEFAULT false,
	"shared_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "animals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"breed_id" text,
	"sex" "sex" NOT NULL,
	"date_of_birth" date,
	"microchip_number" text,
	"registration_number" text,
	"weight" numeric(5, 2),
	"height" numeric(5, 2),
	"color" text,
	"markings" text,
	"profile_image_url" text,
	"bio" text,
	"temperament" text,
	"health_status" text,
	"is_breeding_active" boolean DEFAULT false,
	"is_champion" boolean DEFAULT false,
	"titles" jsonb,
	"dam_id" text,
	"sire_id" text,
	"is_active" boolean DEFAULT true,
	"is_deceased" boolean DEFAULT false,
	"deceased_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "breeds" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"success_rating" numeric(2, 1),
	"size_category" text,
	"average_weight" numeric(5, 2),
	"average_height" numeric(5, 2),
	"description" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "breeds_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "feeding_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"food_type" text,
	"meal_times" jsonb,
	"special_diet" text,
	"supplements" jsonb,
	"calorie_target" integer,
	"special_notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "frozen_semen" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_animal_id" text,
	"collection_date" date NOT NULL,
	"clinic" text,
	"technician_name" text,
	"batch_identifier" text NOT NULL,
	"straw_count" integer NOT NULL,
	"straws_remaining" integer NOT NULL,
	"straws_used" integer DEFAULT 0,
	"storage_location" text,
	"storage_type" text,
	"semen_assessment_id" text,
	"quality_rating" text,
	"status" text DEFAULT 'available',
	"is_available" boolean DEFAULT true,
	"expiry_date" date,
	"is_listed_for_sale" boolean DEFAULT false,
	"marketplace_listing_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "frozen_semen_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"frozen_semen_id" text NOT NULL,
	"litter_id" text,
	"bitch_id" text NOT NULL,
	"usage_date" date NOT NULL,
	"straws_used" integer NOT NULL,
	"breeding_method" text,
	"clinic" text,
	"veterinarian_name" text,
	"was_successful" boolean,
	"resulting_puppies" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "health_records" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"record_type" text NOT NULL,
	"record_date" date NOT NULL,
	"veterinarian_name" text,
	"clinic_name" text,
	"vaccination_type" text,
	"next_due_date" date,
	"medication_name" text,
	"dosage" text,
	"frequency" text,
	"start_date" date,
	"end_date" date,
	"diagnosis" text,
	"treatment" text,
	"cost" integer,
	"currency" text DEFAULT 'USD',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "litters" (
	"id" text PRIMARY KEY NOT NULL,
	"bitch_id" text NOT NULL,
	"sire_id" text,
	"frozen_semen_id" text,
	"mating_date" date NOT NULL,
	"breeding_method" text,
	"expected_whelping_date" date,
	"actual_whelping_date" date,
	"gestation_days" integer,
	"puppy_count" integer,
	"surviving_puppies" integer,
	"male_count" integer,
	"female_count" integer,
	"has_complications" boolean DEFAULT false,
	"complications" text,
	"veterinarian_notes" text,
	"status" text DEFAULT 'expected',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progesterone_readings" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"animal_id" text NOT NULL,
	"reading_date" date NOT NULL,
	"day_number" integer NOT NULL,
	"level" numeric(5, 2) NOT NULL,
	"unit" text NOT NULL,
	"laboratory" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "puppies" (
	"id" text PRIMARY KEY NOT NULL,
	"litter_id" text NOT NULL,
	"animal_id" text,
	"name" text,
	"sex" "sex" NOT NULL,
	"birth_weight" numeric(5, 2),
	"current_weight" numeric(5, 2),
	"color" text,
	"markings" text,
	"status" text DEFAULT 'available',
	"status_date" date,
	"buyer_name" text,
	"buyer_email" text,
	"buyer_phone" text,
	"sale_price" integer,
	"sale_currency" text DEFAULT 'USD',
	"sale_date" date,
	"microchip_number" text,
	"registration_number" text,
	"health_status" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" text DEFAULT 'active',
	"duration_days" integer,
	"has_progesterone_readings" boolean DEFAULT false,
	"progesterone_reading_count" integer DEFAULT 0,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "semen_assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"assessment_date" date NOT NULL,
	"assessment_type" text NOT NULL,
	"technician_name" text,
	"clinic" text,
	"visual_quality" text,
	"visual_notes" text,
	"volume" numeric(5, 2),
	"concentration" integer,
	"total_sperm_count" integer,
	"motility" numeric(5, 2),
	"progressive_motility" numeric(5, 2),
	"morphology" numeric(5, 2),
	"calculated_quality" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role" text NOT NULL,
	"permission_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "role_permissions_role_permission_id_pk" PRIMARY KEY("role","permission_id")
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"user_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"granted" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_permissions_user_id_permission_id_pk" PRIMARY KEY("user_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "escrows" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" text NOT NULL,
	"platform_fee" bigint DEFAULT 0,
	"seller_amount" bigint NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"held_at" timestamp,
	"released_at" timestamp,
	"refunded_at" timestamp,
	"dispute_reason" text,
	"dispute_resolved_by" text,
	"dispute_resolved_at" timestamp,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "escrows_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"wallet_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" text NOT NULL,
	"fee" bigint DEFAULT 0,
	"net_amount" bigint NOT NULL,
	"method" text NOT NULL,
	"destination" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"processed_at" timestamp,
	"completed_at" timestamp,
	"external_transaction_id" text,
	"external_status" text,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" text NOT NULL,
	"fee" bigint DEFAULT 0,
	"net_amount" bigint NOT NULL,
	"balance_before" bigint,
	"balance_after" bigint,
	"related_listing_id" text,
	"related_order_id" text,
	"recipient_user_id" text,
	"payment_method" text,
	"external_transaction_id" text,
	"external_status" text,
	"description" text,
	"notes" text,
	"metadata" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balances" jsonb DEFAULT '{"USD":0,"EUR":0,"GBP":0,"ZAR":0,"BRL":0,"AUD":0,"CAD":0}'::jsonb,
	"pending_balance" jsonb DEFAULT '{}'::jsonb,
	"total_earnings" bigint DEFAULT 0,
	"total_withdrawals" bigint DEFAULT 0,
	"total_transactions" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "kyc_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"verification_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"performed_by" text,
	"previous_status" text,
	"new_status" text,
	"reason" text,
	"notes" text,
	"changes" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"verification_id" text,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"encrypted" boolean DEFAULT true,
	"secure_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"rejection_reason" text,
	"expires_at" timestamp,
	"uploaded_from_ip" text,
	"uploaded_from_device" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"level1_enabled" boolean DEFAULT true,
	"level1_monthly_limit" integer DEFAULT 0,
	"level1_transaction_limit" integer DEFAULT 0,
	"level2_enabled" boolean DEFAULT true,
	"level2_monthly_limit" integer DEFAULT 500000,
	"level2_transaction_limit" integer DEFAULT 200000,
	"level3_enabled" boolean DEFAULT true,
	"level3_monthly_limit" integer DEFAULT -1,
	"level3_transaction_limit" integer DEFAULT -1,
	"require_id_back" boolean DEFAULT true,
	"require_selfie" boolean DEFAULT true,
	"require_proof_of_address" boolean DEFAULT true,
	"auto_approve_level1" boolean DEFAULT true,
	"auto_approve_level2" boolean DEFAULT false,
	"auto_approve_level3" boolean DEFAULT false,
	"verification_expiry_months" integer DEFAULT 24,
	"renewal_reminder_days" integer DEFAULT 30,
	"updated_by" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"tier" text,
	"first_name" text,
	"last_name" text,
	"date_of_birth" date,
	"nationality" text,
	"place_of_birth" text,
	"phone_number" text,
	"phone_verified" boolean DEFAULT false,
	"phone_verified_at" timestamp,
	"phone_verification_code" text,
	"address" jsonb,
	"id_type" text,
	"id_number" text,
	"id_issuing_country" text,
	"id_issue_date" date,
	"id_expiry_date" date,
	"id_front_image" text,
	"id_back_image" text,
	"selfie_image" text,
	"proof_of_address_image" text,
	"business_name" text,
	"business_type" text,
	"business_registration_number" text,
	"business_registration_country" text,
	"tax_id" text,
	"business_address" jsonb,
	"verified_by" text,
	"verified_at" timestamp,
	"rejection_reason" text,
	"review_notes" text,
	"external_provider" text,
	"external_verification_id" text,
	"external_status" text,
	"external_data" jsonb,
	"monthly_limit" integer DEFAULT 0,
	"transaction_limit" integer DEFAULT 0,
	"requires_review" boolean DEFAULT false,
	"expires_at" timestamp,
	"last_renewal_date" timestamp,
	"renewal_reminder_sent_at" timestamp,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kyc_verifications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "breeder_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"bio" text,
	"logo_url" text,
	"banner_url" text,
	"cover_image_url" text,
	"public_email" text,
	"public_phone" text,
	"website" text,
	"social_media" jsonb,
	"location" jsonb,
	"business_name" text,
	"business_type" text,
	"registration_number" text,
	"years_in_business" integer,
	"established_year" integer,
	"primary_breeds" jsonb DEFAULT '[]'::jsonb,
	"secondary_breeds" jsonb DEFAULT '[]'::jsonb,
	"breeding_philosophy" text,
	"specializations" jsonb DEFAULT '[]'::jsonb,
	"certifications" jsonb DEFAULT '[]'::jsonb,
	"awards" jsonb DEFAULT '[]'::jsonb,
	"kyc_verified" boolean DEFAULT false,
	"kyc_verified_at" timestamp,
	"background_check_verified" boolean DEFAULT false,
	"health_certified" boolean DEFAULT false,
	"kennel_club_member" boolean DEFAULT false,
	"kennel_clubs" jsonb DEFAULT '[]'::jsonb,
	"premium_member" boolean DEFAULT false,
	"premium_since" timestamp,
	"premium_expires_at" timestamp,
	"featured_profile" boolean DEFAULT false,
	"total_sales" integer DEFAULT 0,
	"total_listings" integer DEFAULT 0,
	"active_listings" integer DEFAULT 0,
	"total_earnings" numeric(12, 2) DEFAULT '0.00',
	"successful_transactions" integer DEFAULT 0,
	"total_animals" integer DEFAULT 0,
	"total_litters" integer DEFAULT 0,
	"average_rating" numeric(3, 2) DEFAULT '0.00',
	"total_reviews" integer DEFAULT 0,
	"five_star_reviews" integer DEFAULT 0,
	"four_star_reviews" integer DEFAULT 0,
	"three_star_reviews" integer DEFAULT 0,
	"two_star_reviews" integer DEFAULT 0,
	"one_star_reviews" integer DEFAULT 0,
	"response_rate" integer DEFAULT 100,
	"response_time_hours" integer DEFAULT 24,
	"on_time_delivery_rate" integer DEFAULT 100,
	"accepts_international_orders" boolean DEFAULT true,
	"ships_to" jsonb DEFAULT '[]'::jsonb,
	"accepted_payment_methods" jsonb DEFAULT '["wallet","stripe","paypal"]'::jsonb,
	"return_policy" text,
	"shipping_policy" text,
	"health_guarantee" text,
	"breeding_rights" text,
	"is_public" boolean DEFAULT true,
	"profile_complete" boolean DEFAULT false,
	"profile_completeness" integer DEFAULT 0,
	"meta_title" text,
	"meta_description" text,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"last_active_at" timestamp,
	"last_listing_at" timestamp,
	"profile_views" integer DEFAULT 0,
	"profile_views_this_month" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "breeder_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "breeder_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "breeder_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"breeder_id" text NOT NULL,
	"reviewer_id" text,
	"order_id" text,
	"listing_id" text,
	"overall_rating" integer NOT NULL,
	"communication_rating" integer,
	"health_rating" integer,
	"description_accuracy_rating" integer,
	"value_rating" integer,
	"title" text,
	"comment" text NOT NULL,
	"pros" text,
	"cons" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"verified_purchase" boolean DEFAULT false,
	"purchase_date" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"moderated_by" text,
	"moderated_at" timestamp,
	"moderation_notes" text,
	"flag_reason" text,
	"breeder_response" text,
	"breeder_responded_at" timestamp,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"report_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"viewer_id" text,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"review_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conception_rating_history" (
	"id" text PRIMARY KEY NOT NULL,
	"mating_id" text NOT NULL,
	"user_id" text NOT NULL,
	"calculation_type" text NOT NULL,
	"calculated_at" timestamp DEFAULT now(),
	"rating" numeric(5, 2) NOT NULL,
	"information_accuracy" numeric(3, 1),
	"input_data" jsonb,
	"breakdown" jsonb,
	"recommendation" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "matings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bitch_id" text NOT NULL,
	"dog_id" text,
	"frozen_semen_id" text,
	"mating_date" date NOT NULL,
	"breeding_method" "breeding_method" NOT NULL,
	"semen_type" text,
	"status" "mating_status" DEFAULT 'planned',
	"progesterone_rating" numeric(5, 2),
	"conception_rating" numeric(5, 2),
	"overall_rating" numeric(5, 2),
	"information_accuracy" numeric(3, 1),
	"calculation_data" jsonb,
	"rating_breakdown" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "puppy_feeding_generations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	"batch_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days_generated" integer,
	"litters_processed" integer,
	"puppies_processed" integer,
	"tasks_generated" integer,
	"generation_data" jsonb,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "task_reminders" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"reminder_time" timestamp NOT NULL,
	"reminder_type" text,
	"sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"error" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"animal_id" text,
	"type" "task_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date,
	"due_time" text,
	"status" "task_status" DEFAULT 'pending',
	"priority" "task_priority" DEFAULT 'medium',
	"completed_at" timestamp,
	"completed_by" text,
	"task_data" jsonb,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" text,
	"recurring_interval" integer,
	"recurring_until" date,
	"is_auto_generated" boolean DEFAULT false,
	"generated_by" text,
	"generation_batch_id" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weight_records" (
	"id" text PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"user_id" text NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"unit" text DEFAULT 'kg',
	"recorded_date" date NOT NULL,
	"recorded_time" text,
	"recording_method" text,
	"task_id" text,
	"notes" text,
	"body_condition_score" integer,
	"is_ideal_weight" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "export_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"report_generation_id" text,
	"export_type" "report_type" NOT NULL,
	"export_format" "export_format" NOT NULL,
	"file_name" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"filters" jsonb,
	"file_size" integer,
	"file_url" text,
	"download_url" text,
	"download_expiry" timestamp,
	"status" "export_status" DEFAULT 'pending',
	"error" text,
	"record_count" integer,
	"processing_time" integer,
	"download_count" integer DEFAULT 0,
	"last_downloaded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "mating_comparisons" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"comparison_name" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"mating1_id" text NOT NULL,
	"mating2_id" text,
	"mating3_id" text,
	"filters" jsonb,
	"comparison_data" jsonb,
	"last_accessed_at" timestamp,
	"access_count" integer DEFAULT 0,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "report_generations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"report_type" "report_type" NOT NULL,
	"report_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"filters" jsonb,
	"report_data" jsonb,
	"summary" jsonb,
	"generated_at" timestamp DEFAULT now(),
	"record_count" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"country" text DEFAULT 'Australia',
	"postal_code" text,
	"phone" text NOT NULL,
	"email" text,
	"website" text,
	"services" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"years_in_business" integer,
	"license_number" text,
	"certifications" jsonb,
	"operating_hours" jsonb,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "featured_listing_history" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"user_id" text NOT NULL,
	"featured_tier" "featured_tier" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"duration_days" integer,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"payment_id" text,
	"payment_method" text,
	"views_generated" integer DEFAULT 0,
	"inquiries_generated" integer DEFAULT 0,
	"click_through_rate" numeric(5, 2),
	"status" text DEFAULT 'active',
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "listing_inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"inquirer_user_id" text,
	"inquirer_email" text NOT NULL,
	"inquirer_name" text NOT NULL,
	"inquirer_phone" text,
	"message" text NOT NULL,
	"subject" text,
	"replied" boolean DEFAULT false,
	"reply_message" text,
	"replied_at" timestamp,
	"replied_by" text,
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "listing_views" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"user_id" text,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"source" text,
	"viewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "listing_category" NOT NULL,
	"animal_id" text,
	"frozen_semen_id" text,
	"wizard_data" jsonb,
	"title" text NOT NULL,
	"description" text,
	"price" integer,
	"currency" text DEFAULT 'USD',
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"location" text,
	"availability_notes" text,
	"clinic_id" text,
	"additional_images" jsonb DEFAULT '[]'::jsonb,
	"is_featured" boolean DEFAULT false,
	"featured_tier" "featured_tier" DEFAULT 'none',
	"featured_start_date" date,
	"featured_end_date" date,
	"featured_priority" integer DEFAULT 0,
	"featured_payment_id" text,
	"featured_amount" integer,
	"featured_currency" text,
	"breed" text,
	"sex" text,
	"age" text,
	"color" text,
	"registration_number" text,
	"health_certified" boolean DEFAULT false,
	"champion_lines" boolean DEFAULT false,
	"status" "listing_status" DEFAULT 'draft',
	"view_count" integer DEFAULT 0,
	"interested_count" integer DEFAULT 0,
	"inquiry_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"auto_renew" boolean DEFAULT false,
	"published_at" timestamp,
	"sold_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"notes" text,
	"tags" jsonb,
	"saved_at" timestamp DEFAULT now(),
	"last_viewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "accounts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "accounts" CASCADE;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "verification_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferences" SET DEFAULT '{"notifications":true,"emailUpdates":true,"darkMode":false,"language":"en","timezone":"UTC","currency":"USD","locale":"en-US","dateFormat":"MM/DD/YYYY","timeFormat":"12h","measurementUnit":"metric","firstDayOfWeek":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "animal_documents" ADD CONSTRAINT "animal_documents_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_photos" ADD CONSTRAINT "animal_photos_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_reminders" ADD CONSTRAINT "animal_reminders_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_reminders" ADD CONSTRAINT "animal_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_shares" ADD CONSTRAINT "animal_shares_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_shares" ADD CONSTRAINT "animal_shares_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animal_shares" ADD CONSTRAINT "animal_shares_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animals" ADD CONSTRAINT "animals_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breeds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feeding_plans" ADD CONSTRAINT "feeding_plans_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD CONSTRAINT "frozen_semen_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD CONSTRAINT "frozen_semen_source_animal_id_animals_id_fk" FOREIGN KEY ("source_animal_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD CONSTRAINT "frozen_semen_semen_assessment_id_semen_assessments_id_fk" FOREIGN KEY ("semen_assessment_id") REFERENCES "public"."semen_assessments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ADD CONSTRAINT "frozen_semen_usage_frozen_semen_id_frozen_semen_id_fk" FOREIGN KEY ("frozen_semen_id") REFERENCES "public"."frozen_semen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ADD CONSTRAINT "frozen_semen_usage_litter_id_litters_id_fk" FOREIGN KEY ("litter_id") REFERENCES "public"."litters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ADD CONSTRAINT "frozen_semen_usage_bitch_id_animals_id_fk" FOREIGN KEY ("bitch_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "litters" ADD CONSTRAINT "litters_bitch_id_animals_id_fk" FOREIGN KEY ("bitch_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "litters" ADD CONSTRAINT "litters_sire_id_animals_id_fk" FOREIGN KEY ("sire_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_readings" ADD CONSTRAINT "progesterone_readings_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_readings" ADD CONSTRAINT "progesterone_readings_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puppies" ADD CONSTRAINT "puppies_litter_id_litters_id_fk" FOREIGN KEY ("litter_id") REFERENCES "public"."litters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puppies" ADD CONSTRAINT "puppies_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semen_assessments" ADD CONSTRAINT "semen_assessments_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_dispute_resolved_by_users_id_fk" FOREIGN KEY ("dispute_resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_audit_log" ADD CONSTRAINT "kyc_audit_log_verification_id_kyc_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."kyc_verifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_audit_log" ADD CONSTRAINT "kyc_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_audit_log" ADD CONSTRAINT "kyc_audit_log_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_verification_id_kyc_verifications_id_fk" FOREIGN KEY ("verification_id") REFERENCES "public"."kyc_verifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_settings" ADD CONSTRAINT "kyc_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeder_profiles" ADD CONSTRAINT "breeder_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeder_reviews" ADD CONSTRAINT "breeder_reviews_breeder_id_breeder_profiles_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."breeder_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeder_reviews" ADD CONSTRAINT "breeder_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeder_reviews" ADD CONSTRAINT "breeder_reviews_moderated_by_users_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_profile_id_breeder_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."breeder_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewer_id_users_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_breeder_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."breeder_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_breeder_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."breeder_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conception_rating_history" ADD CONSTRAINT "conception_rating_history_mating_id_matings_id_fk" FOREIGN KEY ("mating_id") REFERENCES "public"."matings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conception_rating_history" ADD CONSTRAINT "conception_rating_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matings" ADD CONSTRAINT "matings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matings" ADD CONSTRAINT "matings_bitch_id_animals_id_fk" FOREIGN KEY ("bitch_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matings" ADD CONSTRAINT "matings_dog_id_animals_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matings" ADD CONSTRAINT "matings_frozen_semen_id_frozen_semen_id_fk" FOREIGN KEY ("frozen_semen_id") REFERENCES "public"."frozen_semen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puppy_feeding_generations" ADD CONSTRAINT "puppy_feeding_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_reminders" ADD CONSTRAINT "task_reminders_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_reminders" ADD CONSTRAINT "task_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "export_history" ADD CONSTRAINT "export_history_report_generation_id_report_generations_id_fk" FOREIGN KEY ("report_generation_id") REFERENCES "public"."report_generations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ADD CONSTRAINT "mating_comparisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ADD CONSTRAINT "mating_comparisons_mating1_id_matings_id_fk" FOREIGN KEY ("mating1_id") REFERENCES "public"."matings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ADD CONSTRAINT "mating_comparisons_mating2_id_matings_id_fk" FOREIGN KEY ("mating2_id") REFERENCES "public"."matings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ADD CONSTRAINT "mating_comparisons_mating3_id_matings_id_fk" FOREIGN KEY ("mating3_id") REFERENCES "public"."matings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_generations" ADD CONSTRAINT "report_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_listing_history" ADD CONSTRAINT "featured_listing_history_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "featured_listing_history" ADD CONSTRAINT "featured_listing_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ADD CONSTRAINT "listing_inquiries_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ADD CONSTRAINT "listing_inquiries_inquirer_user_id_users_id_fk" FOREIGN KEY ("inquirer_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ADD CONSTRAINT "listing_inquiries_replied_by_users_id_fk" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_views" ADD CONSTRAINT "listing_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_frozen_semen_id_frozen_semen_id_fk" FOREIGN KEY ("frozen_semen_id") REFERENCES "public"."frozen_semen"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;