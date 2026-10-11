import {
  boolean,
  customType,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// Uploaded images (exec headshots, event covers, fact illustrations). Stored in
// Postgres so uploads work with zero extra services; served by /images/[id].
// Images are resized client-side before upload, so rows stay small.
export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  data: bytea("data").notNull(),
  contentType: text("content_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  createdAt: createdAt(),
});

// A local branch of the club (e.g. McMaster, Brampton). Execs and events can
// belong to a chapter; a null chapter means organization-wide.
export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  institution: text("institution"),
  city: text("city"),
  description: text("description"),
  email: text("email"),
  instagram: text("instagram"),
  meetingInfo: text("meeting_info"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  theme: text("theme"),
  location: text("location"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  description: text("description"),
  // Written after the event happens; shown in the past-events archive.
  recap: text("recap"),
  rsvpUrl: text("rsvp_url"),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  imageId: uuid("image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const execs = pgTable("execs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  pronouns: text("pronouns"),
  role: text("role").notNull(),
  program: text("program"),
  year: text("year"),
  school: text("school"),
  bio: text("bio"),
  email: text("email"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "set null",
  }),
  photoId: uuid("photo_id").references(() => images.id, {
    onDelete: "set null",
  }),
  // Academic year of the term served, e.g. "2026–27". Inactive execs are shown
  // in the "Past executives" archive.
  term: text("term"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const facts = pgTable("facts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title"),
  // The body text. Column keeps its original name for backward compatibility.
  fact: text("fact").notNull(),
  // Date the fact refers to; every part is optional. Year is negative for BCE.
  year: integer("year"),
  month: integer("month"),
  day: integer("day"),
  region: text("region"),
  source: text("source"),
  sourceUrl: text("source_url"),
  imageId: uuid("image_id").references(() => images.id, {
    onDelete: "set null",
  }),
  published: boolean("published").notNull().default(true),
  createdAt: createdAt(),
});

// Key/value store for one-off site copy (tagline, intro, join link, ...).
// Known keys and their validation live in src/lib/site-content.ts.
export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Organization-wide contact/social links, shown in the footer and join section.
export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  platform: text("platform").notNull(),
  label: text("label"),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// The "What we do" cards on the home page.
export const pillars = pgTable("pillars", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Image = typeof images.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Exec = typeof execs.$inferSelect;
export type NewExec = typeof execs.$inferInsert;
export type Fact = typeof facts.$inferSelect;
export type NewFact = typeof facts.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
export type NewSiteContent = typeof siteContent.$inferInsert;
export type Link = typeof links.$inferSelect;
export type Pillar = typeof pillars.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
