CREATE TYPE "public"."progesterone_reminder_type" AS ENUM('test_due', 'breeding_window', 'daily_test', 'whelping_approaching');--> statement-breakpoint
ALTER TYPE "public"."laboratory_type" ADD VALUE 'IMMULITE';--> statement-breakpoint
ALTER TYPE "public"."laboratory_type" ADD VALUE 'RIA';--> statement-breakpoint
ALTER TYPE "public"."laboratory_type" ADD VALUE 'ELISA';--> statement-breakpoint
ALTER TYPE "public"."laboratory_type" ADD VALUE 'OTHER';--> statement-breakpoint
CREATE TABLE "progesterone_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"breeder_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"breeding_method" "heat_cycle_breeding_method" NOT NULL,
	"first_test_day" integer DEFAULT 5 NOT NULL,
	"preferred_laboratory" "laboratory_type" DEFAULT 'VIDAS',
	"reminder_channels" text[] DEFAULT '{"email","in_app"}',
	"times_used" integer DEFAULT 0 NOT NULL,
	"last_used" timestamp,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "breeding_records" DROP CONSTRAINT "breeding_records_stud_id_animals_id_fk";
--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ALTER COLUMN "reminder_type" SET DATA TYPE "public"."progesterone_reminder_type" USING "reminder_type"::text::"public"."progesterone_reminder_type";--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ALTER COLUMN "due_time" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ALTER COLUMN "due_time" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ALTER COLUMN "channels" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ALTER COLUMN "channels" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ALTER COLUMN "channels" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "breeder_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "breeding_day" integer;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "breeding_method" "breeding_record_method" NOT NULL;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "frozen_semen_id" uuid;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "semen_quality" text;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "motility" integer;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "concentration" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "breeding_records" ADD COLUMN "progesterone_level_at_breeding" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "heat_cycle_progesterone_readings" ADD COLUMN "breeder_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "heat_cycles" ADD COLUMN "successful" boolean;--> statement-breakpoint
ALTER TABLE "heat_cycles" ADD COLUMN "actual_whelping_date" date;--> statement-breakpoint
ALTER TABLE "progesterone_templates" ADD CONSTRAINT "progesterone_templates_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_stud_id_animals_id_fk" FOREIGN KEY ("stud_id") REFERENCES "public"."animals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "heat_cycle_progesterone_readings" ADD CONSTRAINT "heat_cycle_progesterone_readings_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeding_records" DROP COLUMN "breeding_time";--> statement-breakpoint
ALTER TABLE "breeding_records" DROP COLUMN "method";--> statement-breakpoint
ALTER TABLE "breeding_records" DROP COLUMN "frozen_semen_batch_id";--> statement-breakpoint
ALTER TABLE "breeding_records" DROP COLUMN "tie_duration_minutes";--> statement-breakpoint
ALTER TABLE "breeding_records" DROP COLUMN "successful";--> statement-breakpoint
ALTER TABLE "breeding_records" DROP COLUMN "updated_at";--> statement-breakpoint
DROP TYPE "public"."heat_cycle_reminder_type";