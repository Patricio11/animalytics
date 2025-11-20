CREATE TYPE "public"."conversation_status" AS ENUM('active', 'archived', 'blocked', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'document', 'system', 'offer', 'listing_share');--> statement-breakpoint
CREATE TYPE "public"."delivery_method" AS ENUM('pickup', 'delivery', 'shipping', 'meet_halfway', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('wallet', 'stripe', 'paypal', 'bank_transfer', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'payment_pending', 'payment_completed', 'confirmed', 'preparing', 'ready_for_pickup', 'in_transit', 'completed', 'cancelled', 'refunded', 'disputed');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'buyer';--> statement-breakpoint
CREATE TABLE "buyer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar" text,
	"location" jsonb,
	"interested_breeds" jsonb DEFAULT '[]'::jsonb,
	"budget_range" jsonb,
	"looking_for" jsonb DEFAULT '[]'::jsonb,
	"preferred_gender" text,
	"experience_level" text,
	"total_purchases" integer DEFAULT 0,
	"total_spent" numeric(12, 2) DEFAULT '0.00',
	"favorite_count" integer DEFAULT 0,
	"inquiry_count" integer DEFAULT 0,
	"average_response_time" integer,
	"profile_views" integer DEFAULT 0,
	"last_active_at" timestamp,
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"phone_verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"show_real_name" boolean DEFAULT true,
	"show_location" boolean DEFAULT true,
	"allow_messages" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buyer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"muted_until" timestamp,
	"notifications_enabled" boolean DEFAULT true,
	"last_read_at" timestamp,
	"last_seen_message_id" uuid,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"subject" text,
	"status" "conversation_status" DEFAULT 'active' NOT NULL,
	"unread_count_buyer" integer DEFAULT 0 NOT NULL,
	"unread_count_seller" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"archived_by_buyer" boolean DEFAULT false,
	"archived_by_seller" boolean DEFAULT false,
	"archived_by_buyer_at" timestamp,
	"archived_by_seller_at" timestamp,
	"blocked_by_buyer" boolean DEFAULT false,
	"blocked_by_seller" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"message" text NOT NULL,
	"message_type" "message_type" DEFAULT 'text' NOT NULL,
	"attachments" text[],
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"metadata" text,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"document_name" text NOT NULL,
	"document_url" text NOT NULL,
	"document_size" integer,
	"mime_type" text,
	"uploaded_by" text,
	"uploader_role" text,
	"is_public" boolean DEFAULT false,
	"accessible_to_buyer" boolean DEFAULT true,
	"accessible_to_seller" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"verified_by" text,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_title" text NOT NULL,
	"event_description" text,
	"old_status" text,
	"new_status" text,
	"actor_id" text,
	"actor_role" text,
	"visible_to_buyer" boolean DEFAULT true,
	"visible_to_seller" boolean DEFAULT true,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"animal_id" uuid,
	"buyer_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"purchase_price" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"platform_fee" integer DEFAULT 0,
	"total_amount" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"payment_intent_id" text,
	"payment_completed_at" timestamp,
	"delivery_method" "delivery_method" NOT NULL,
	"delivery_address" text,
	"delivery_city" text,
	"delivery_state" text,
	"delivery_postal_code" text,
	"delivery_country" text,
	"delivery_notes" text,
	"scheduled_date" date,
	"scheduled_time" text,
	"actual_handover_date" timestamp,
	"ownership_transferred" boolean DEFAULT false,
	"transferred_at" timestamp,
	"previous_owner_id" text,
	"contract_url" text,
	"health_certificates" text[],
	"registration_papers" text[],
	"vaccination_records" text[],
	"other_documents" text[],
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"initiated_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	"prepared_at" timestamp,
	"ready_at" timestamp,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"cancelled_by" text,
	"refund_amount" integer,
	"refunded_at" timestamp,
	"is_disputed" boolean DEFAULT false,
	"dispute_reason" text,
	"dispute_opened_at" timestamp,
	"dispute_resolved_at" timestamp,
	"dispute_resolution" text,
	"buyer_review_id" uuid,
	"seller_review_id" uuid,
	"buyer_review_submitted" boolean DEFAULT false,
	"seller_review_submitted" boolean DEFAULT false,
	"buyer_notes" text,
	"seller_notes" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_documents" ADD CONSTRAINT "purchase_documents_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_documents" ADD CONSTRAINT "purchase_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_documents" ADD CONSTRAINT "purchase_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_timeline" ADD CONSTRAINT "purchase_timeline_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_timeline" ADD CONSTRAINT "purchase_timeline_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_animal_id_animals_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;