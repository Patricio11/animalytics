-- Migration: Add manual pedigree entries table
-- Description: Allows storing external animals (not in system) for pedigree trees
-- Created: 2025-10-23

CREATE TABLE IF NOT EXISTS "manual_pedigree_entries" (
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

-- Add foreign key constraints
ALTER TABLE "manual_pedigree_entries" ADD CONSTRAINT "manual_pedigree_entries_animal_id_animals_id_fk" 
	FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "manual_pedigree_entries" ADD CONSTRAINT "manual_pedigree_entries_user_id_users_id_fk" 
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "manual_pedigree_entries_animal_id_idx" ON "manual_pedigree_entries" ("animal_id");
CREATE INDEX IF NOT EXISTS "manual_pedigree_entries_user_id_idx" ON "manual_pedigree_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "manual_pedigree_entries_position_idx" ON "manual_pedigree_entries" ("position");
CREATE INDEX IF NOT EXISTS "manual_pedigree_entries_generation_idx" ON "manual_pedigree_entries" ("generation");
