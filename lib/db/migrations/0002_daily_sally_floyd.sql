ALTER TABLE "purchases" ADD COLUMN "escrow_id" uuid;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "buyer_confirmed_receipt" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "buyer_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "seller_confirmed_handover" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "seller_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "auto_release_date" timestamp;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "auto_release_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_escrow_id_escrows_id_fk" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrows"("id") ON DELETE set null ON UPDATE no action;