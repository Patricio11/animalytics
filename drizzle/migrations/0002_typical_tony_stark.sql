ALTER TYPE "public"."photo_category" ADD VALUE 'whelping_areas';--> statement-breakpoint
ALTER TYPE "public"."photo_category" ADD VALUE 'vaccinations';--> statement-breakpoint
ALTER TYPE "public"."photo_category" ADD VALUE 'council_registration';--> statement-breakpoint
ALTER TYPE "public"."photo_category" ADD VALUE 'parents';--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD COLUMN "volume" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD COLUMN "concentration" integer;--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD COLUMN "motility" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "frozen_semen" ADD COLUMN "morphology" numeric(5, 2);