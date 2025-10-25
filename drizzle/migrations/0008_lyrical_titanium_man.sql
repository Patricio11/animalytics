ALTER TYPE "public"."photo_category" ADD VALUE 'gallery' BEFORE 'training';--> statement-breakpoint
CREATE TABLE "manual_pedigree_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"position" text NOT NULL,
	"generation" integer NOT NULL,
	"name" text NOT NULL,
	"registered_name" text,
	"registration_number" text,
	"microchip_number" text,
	"breed" text,
	"sex" "sex",
	"date_of_birth" date,
	"color" text,
	"titles" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progesterone_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"animal_id" uuid,
	"mating_id" uuid,
	"test_date" date NOT NULL,
	"laboratory" "laboratory" NOT NULL,
	"unit" "unit" NOT NULL,
	"breeding_method" "breeding_method" NOT NULL,
	"readings" jsonb NOT NULL,
	"rating" numeric(5, 2),
	"alternative_rating" numeric(5, 2),
	"matched_pattern" text,
	"confidence" numeric(5, 2),
	"trend" text,
	"average_change" numeric(10, 4),
	"is_optimal" text,
	"recommendation" text,
	"recommendation_message" text,
	"suggested_action" text,
	"breeding_window" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "manual_pedigree_entries" ADD CONSTRAINT "manual_pedigree_entries_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_pedigree_entries" ADD CONSTRAINT "manual_pedigree_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_tests" ADD CONSTRAINT "progesterone_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_tests" ADD CONSTRAINT "progesterone_tests_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_tests" ADD CONSTRAINT "progesterone_tests_mating_id_matings_id_fk" FOREIGN KEY ("mating_id") REFERENCES "public"."matings"("id") ON DELETE set null ON UPDATE no action;