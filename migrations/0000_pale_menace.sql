CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"facility_id" varchar NOT NULL,
	"facility_name" text NOT NULL,
	"facility_location" text NOT NULL,
	"quantity" integer NOT NULL,
	"duration" integer NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_cost" double precision NOT NULL,
	"price_per_kg_per_day" double precision NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"storage_type" text NOT NULL,
	"storage_category" text DEFAULT 'Fruits & Vegetables' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"distance" double precision DEFAULT 0 NOT NULL,
	"type" text[] NOT NULL,
	"price_per_kg_per_day" double precision NOT NULL,
	"total_capacity" integer NOT NULL,
	"available_capacity" integer NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"certifications" text[] DEFAULT '{}'::text[] NOT NULL,
	"contact_phone" text NOT NULL,
	"operating_hours" text NOT NULL,
	"min_booking_days" integer DEFAULT 1 NOT NULL,
	"amenities" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"severity" text NOT NULL,
	"icon" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'farmer' NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;