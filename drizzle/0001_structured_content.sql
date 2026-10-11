CREATE TABLE IF NOT EXISTS "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"institution" text,
	"city" text,
	"description" text,
	"email" text,
	"instagram" text,
	"meeting_info" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chapters_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data" "bytea" NOT NULL,
	"content_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" text NOT NULL,
	"label" text,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pillars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "facts" ALTER COLUMN "month" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "recap" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "rsvp_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "image_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "pronouns" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "program" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "year" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "school" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "email" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "instagram" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "linkedin" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "photo_id" uuid;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "term" text;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "execs" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "title" text;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "year" integer;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "day" integer;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "region" text;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "source_url" text;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "image_id" uuid;--> statement-breakpoint
ALTER TABLE "facts" ADD COLUMN IF NOT EXISTS "published" boolean DEFAULT true NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "execs" ADD CONSTRAINT "execs_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "execs" ADD CONSTRAINT "execs_photo_id_images_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "facts" ADD CONSTRAINT "facts_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- Data backfill: pull trailing pronouns like "Jane Doe (she/her)" out of names.
UPDATE "execs"
SET "pronouns" = substring("name" from '\(([^()]*/[^()]*)\)\s*$'),
    "name" = trim(regexp_replace("name", '\s*\([^()]*/[^()]*\)\s*$', ''))
WHERE "pronouns" IS NULL AND "name" ~ '\([^()]*/[^()]*\)\s*$';
--> statement-breakpoint
-- Keep the existing display order (previously insertion order).
UPDATE "execs" SET "sort_order" = ordered.rn
FROM (SELECT "id", row_number() OVER (ORDER BY "created_at") - 1 AS rn FROM "execs") AS ordered
WHERE "execs"."id" = ordered."id";
--> statement-breakpoint
-- Move contact fields from site_content into the links table.
INSERT INTO "links" ("platform", "url", "sort_order")
SELECT v.platform, sc."value", v.ord
FROM (VALUES ('contact_email', 'email', 0), ('contact_instagram', 'instagram', 1), ('contact_discord', 'discord', 2)) AS v(key, platform, ord)
JOIN "site_content" sc ON sc."key" = v.key
WHERE trim(sc."value") <> '' AND NOT EXISTS (SELECT 1 FROM "links");
--> statement-breakpoint
-- The home page "What we do" cards were hardcoded; seed them so they're editable.
INSERT INTO "pillars" ("title", "body", "sort_order")
SELECT v.title, v.body, v.ord
FROM (VALUES
  ('The land we live on', 'Local and Indigenous history of the places our chapters call home.', 0),
  ('World history', 'From ancient empires to the modern era, told through events and discussion.', 1),
  ('Open to all', 'Come as you are. Membership is free and everyone is welcome.', 2)
) AS v(title, body, ord)
WHERE NOT EXISTS (SELECT 1 FROM "pillars");
