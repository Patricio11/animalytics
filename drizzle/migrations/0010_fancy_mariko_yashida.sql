CREATE TYPE "public"."breeding_record_method" AS ENUM('natural', 'ai_fresh', 'ai_chilled', 'ai_frozen', 'tci', 'surgical');--> statement-breakpoint
CREATE TYPE "public"."heat_cycle_breeding_method" AS ENUM('natural_ai', 'frozen');--> statement-breakpoint
CREATE TYPE "public"."heat_cycle_reminder_type" AS ENUM('test_due', 'breeding_window', 'daily_test', 'whelping_approaching');--> statement-breakpoint
CREATE TYPE "public"."heat_cycle_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."laboratory_type" AS ENUM('VIDAS', 'IDEXX');--> statement-breakpoint
CREATE TYPE "public"."progesterone_unit" AS ENUM('nanograms', 'nanomoles');--> statement-breakpoint
CREATE TYPE "public"."reminder_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TABLE "breeding_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heat_cycle_id" uuid NOT NULL,
	"breeding_date" date NOT NULL,
	"breeding_time" text,
	"stud_id" uuid,
	"stud_name" text,
	"stud_registration" text,
	"method" "breeding_record_method" NOT NULL,
	"frozen_semen_batch_id" uuid,
	"tie_duration_minutes" integer,
	"successful" boolean,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "heat_cycle_progesterone_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heat_cycle_id" uuid NOT NULL,
	"day" integer NOT NULL,
	"test_date" date NOT NULL,
	"progesterone_level" numeric(5, 2) NOT NULL,
	"unit" "progesterone_unit" DEFAULT 'nanograms' NOT NULL,
	"laboratory" "laboratory_type" DEFAULT 'VIDAS',
	"phase" text,
	"phase_color" text,
	"next_test_days" integer,
	"next_test_date" date,
	"next_test_reason" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "heat_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"breeder_id" text NOT NULL,
	"bitch_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"current_day" integer DEFAULT 1 NOT NULL,
	"status" "heat_cycle_status" DEFAULT 'active' NOT NULL,
	"breeding_method" "heat_cycle_breeding_method" NOT NULL,
	"estimated_ovulation_day" integer,
	"estimated_ovulation_date" date,
	"estimated_whelping_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "progesterone_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heat_cycle_id" uuid NOT NULL,
	"breeder_id" text NOT NULL,
	"reminder_type" "heat_cycle_reminder_type" NOT NULL,
	"due_date" date NOT NULL,
	"due_time" text DEFAULT '09:00:00' NOT NULL,
	"sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"channels" jsonb DEFAULT '["in_app"]'::jsonb NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" "reminder_priority" DEFAULT 'normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "animals" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_heat_cycle_id_heat_cycles_id_fk" FOREIGN KEY ("heat_cycle_id") REFERENCES "public"."heat_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_stud_id_animals_id_fk" FOREIGN KEY ("stud_id") REFERENCES "public"."animals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "heat_cycle_progesterone_readings" ADD CONSTRAINT "heat_cycle_progesterone_readings_heat_cycle_id_heat_cycles_id_fk" FOREIGN KEY ("heat_cycle_id") REFERENCES "public"."heat_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "heat_cycles" ADD CONSTRAINT "heat_cycles_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "heat_cycles" ADD CONSTRAINT "heat_cycles_bitch_id_animals_id_fk" FOREIGN KEY ("bitch_id") REFERENCES "public"."animals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ADD CONSTRAINT "progesterone_reminders_heat_cycle_id_heat_cycles_id_fk" FOREIGN KEY ("heat_cycle_id") REFERENCES "public"."heat_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progesterone_reminders" ADD CONSTRAINT "progesterone_reminders_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;