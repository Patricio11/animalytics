CREATE TABLE "breeder_breed_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"breeder_profile_id" uuid NOT NULL,
	"breed_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breeder_breed_preferences_unique" (
	"breeder_profile_id" uuid NOT NULL,
	"breed_id" uuid NOT NULL,
	CONSTRAINT "breeder_breed_preferences_unique_breeder_profile_id_breed_id_pk" PRIMARY KEY("breeder_profile_id","breed_id")
);
--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "breeding_notes" text;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "stud_fee" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "health_certifications" jsonb;--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "genetic_tests" jsonb;--> statement-breakpoint
ALTER TABLE "breeder_breed_preferences" ADD CONSTRAINT "breeder_breed_preferences_breeder_profile_id_breeder_profiles_id_fk" FOREIGN KEY ("breeder_profile_id") REFERENCES "public"."breeder_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeder_breed_preferences" ADD CONSTRAINT "breeder_breed_preferences_breed_id_breeds_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breeds"("id") ON DELETE cascade ON UPDATE no action;