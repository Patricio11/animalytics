-- Add breeding-specific fields to animals table
ALTER TABLE "animals" ADD COLUMN "breeding_notes" text;
ALTER TABLE "animals" ADD COLUMN "stud_fee" numeric(10, 2);

-- Add health certifications and genetic tests
ALTER TABLE "animals" ADD COLUMN "health_certifications" jsonb;
ALTER TABLE "animals" ADD COLUMN "genetic_tests" jsonb;
