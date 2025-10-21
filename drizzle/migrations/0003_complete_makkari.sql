CREATE TABLE "pedigree_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"title" text,
	"file_url" text NOT NULL,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "pedigree_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"animal_id" text NOT NULL,
	"snapshot_json" text NOT NULL,
	"generations" integer DEFAULT 4,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "animal_documents" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_documents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animal_documents" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_photos" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_photos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animal_photos" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_reminders" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_reminders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animal_reminders" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_shares" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animal_shares" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animal_shares" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "breed_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "dam_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "sire_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "breeds" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "breeds" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "feeding_plans" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "feeding_plans" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "feeding_plans" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "frozen_semen" ALTER COLUMN "source_animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen" ALTER COLUMN "semen_assessment_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ALTER COLUMN "frozen_semen_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ALTER COLUMN "litter_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "frozen_semen_usage" ALTER COLUMN "bitch_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "health_records" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "health_records" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "health_records" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "litters" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "litters" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "litters" ALTER COLUMN "bitch_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "litters" ALTER COLUMN "sire_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "litters" ALTER COLUMN "frozen_semen_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "progesterone_readings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "progesterone_readings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "progesterone_readings" ALTER COLUMN "season_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "progesterone_readings" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "puppies" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "puppies" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "puppies" ALTER COLUMN "litter_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "puppies" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "seasons" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "semen_assessments" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "semen_assessments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "semen_assessments" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "escrows" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "escrows" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payout_requests" ALTER COLUMN "wallet_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "wallet_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "kyc_audit_log" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "kyc_audit_log" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "kyc_audit_log" ALTER COLUMN "verification_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "kyc_documents" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "kyc_documents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "kyc_documents" ALTER COLUMN "verification_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "kyc_settings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "kyc_settings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "kyc_verifications" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "breeder_profiles" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "breeder_profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "breeder_reviews" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "breeder_reviews" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "breeder_reviews" ALTER COLUMN "breeder_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "profile_views" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "profile_views" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "profile_views" ALTER COLUMN "profile_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "review_reports" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "review_reports" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "review_reports" ALTER COLUMN "review_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "review_votes" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "review_votes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "review_votes" ALTER COLUMN "review_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "conception_rating_history" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "conception_rating_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "conception_rating_history" ALTER COLUMN "mating_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "matings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "matings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "matings" ALTER COLUMN "bitch_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "matings" ALTER COLUMN "dog_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "matings" ALTER COLUMN "frozen_semen_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "puppy_feeding_generations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "puppy_feeding_generations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "task_reminders" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "task_reminders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "task_reminders" ALTER COLUMN "task_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "weight_records" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "weight_records" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "weight_records" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "export_history" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "export_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "export_history" ALTER COLUMN "report_generation_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "mating_comparisons" ALTER COLUMN "mating1_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ALTER COLUMN "mating2_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "mating_comparisons" ALTER COLUMN "mating3_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "report_generations" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "report_generations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "featured_listing_history" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "featured_listing_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "featured_listing_history" ALTER COLUMN "listing_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listing_inquiries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "listing_inquiries" ALTER COLUMN "listing_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listing_views" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listing_views" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "listing_views" ALTER COLUMN "listing_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "animal_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "frozen_semen_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "saved_listings" ALTER COLUMN "listing_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "pedigree_documents" ADD CONSTRAINT "pedigree_documents_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedigree_documents" ADD CONSTRAINT "pedigree_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedigree_snapshots" ADD CONSTRAINT "pedigree_snapshots_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedigree_snapshots" ADD CONSTRAINT "pedigree_snapshots_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;