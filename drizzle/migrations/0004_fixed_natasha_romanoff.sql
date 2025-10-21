ALTER TABLE "role_permissions" ALTER COLUMN "permission_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "user_permissions" ALTER COLUMN "permission_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "weight_records" ALTER COLUMN "task_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "clinic_id" SET DATA TYPE uuid;