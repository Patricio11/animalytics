CREATE TABLE "heat_cycle_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"heat_cycle_id" uuid NOT NULL,
	"breeder_id" text NOT NULL,
	"reminder_type" "progesterone_reminder_type" NOT NULL,
	"due_date" date NOT NULL,
	"due_time" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" "reminder_priority" DEFAULT 'normal' NOT NULL,
	"channels" text[],
	"sent" boolean DEFAULT false NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "progesterone_reminders" CASCADE;--> statement-breakpoint
ALTER TABLE "heat_cycle_reminders" ADD CONSTRAINT "heat_cycle_reminders_heat_cycle_id_heat_cycles_id_fk" FOREIGN KEY ("heat_cycle_id") REFERENCES "public"."heat_cycles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "heat_cycle_reminders" ADD CONSTRAINT "heat_cycle_reminders_breeder_id_users_id_fk" FOREIGN KEY ("breeder_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;