import { and, asc, desc, eq, gte, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import {
  chapters,
  events,
  execs,
  facts,
  faqs,
  links,
  pillars,
  type Chapter,
  type Fact,
} from "@/db/schema";
import { today } from "./format";

export { imageUrl } from "./view";

export async function getChapters() {
  return db
    .select()
    .from(chapters)
    .where(eq(chapters.published, true))
    .orderBy(asc(chapters.sortOrder), asc(chapters.name));
}

export function chapterMap(list: Chapter[]) {
  return new Map(list.map((c) => [c.id, c]));
}

// An event counts as upcoming until it ends (or, with no end time, for three
// hours after it starts) so it doesn't vanish from the site mid-event.
const GRACE_MS = 3 * 60 * 60 * 1000;
function upcomingCutoff() {
  return new Date(Date.now() - GRACE_MS);
}

export async function getUpcomingEvents(
  opts: {
    chapterId?: string;
    limit?: number;
  } = {},
) {
  const query = db
    .select()
    .from(events)
    .where(
      and(
        eq(events.published, true),
        or(
          gte(events.endsAt, new Date()),
          and(isNull(events.endsAt), gte(events.eventDate, upcomingCutoff())),
        ),
        opts.chapterId ? eq(events.chapterId, opts.chapterId) : undefined,
      ),
    )
    .orderBy(asc(events.eventDate));
  return opts.limit ? query.limit(opts.limit) : query;
}

export async function getPastEvents(opts: { chapterId?: string } = {}) {
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.published, true),
        or(
          lt(events.endsAt, new Date()),
          and(isNull(events.endsAt), lt(events.eventDate, upcomingCutoff())),
        ),
        opts.chapterId ? eq(events.chapterId, opts.chapterId) : undefined,
      ),
    )
    .orderBy(desc(events.eventDate));
}

export function isPast(event: { eventDate: Date; endsAt: Date | null }) {
  const end = event.endsAt ?? new Date(event.eventDate.getTime() + GRACE_MS);
  return end < new Date();
}

export async function getActiveExecs() {
  return db
    .select()
    .from(execs)
    .where(eq(execs.active, true))
    .orderBy(asc(execs.sortOrder), asc(execs.createdAt));
}

export async function getPastExecs() {
  return db
    .select()
    .from(execs)
    .where(eq(execs.active, false))
    .orderBy(desc(execs.term), asc(execs.sortOrder));
}

export async function getPublishedFacts() {
  return db.select().from(facts).where(eq(facts.published, true));
}

/** Oldest first; undated facts last. */
export function sortChronologically(list: Fact[]) {
  const key = (f: Fact) => [
    f.year ?? Number.POSITIVE_INFINITY,
    f.month ?? 0,
    f.day ?? 0,
  ];
  return [...list].sort((a, b) => {
    const [ka, kb] = [key(a), key(b)];
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return ka[i] - kb[i];
    }
    return 0;
  });
}

export type FeaturedFacts = {
  mode: "today" | "month" | "archive";
  featured: Fact;
  more: Fact[];
};

/**
 * Picks what the home page shows, so the section is never empty while any fact
 * exists: a fact from today's date, else the closest one this month, else a
 * fact from the archive (rotating daily).
 */
export async function getFeaturedFacts(): Promise<FeaturedFacts | null> {
  const all = await getPublishedFacts();
  if (all.length === 0) return null;
  const { month, day, year } = today();

  const thisMonth = all
    .filter((f) => f.month === month)
    .sort(
      (a, b) =>
        Math.abs((a.day ?? 99) - day) - Math.abs((b.day ?? 99) - day) ||
        (a.year ?? 0) - (b.year ?? 0),
    );

  if (thisMonth.length > 0) {
    const [featured, ...more] = thisMonth;
    return {
      mode: featured.day === day ? "today" : "month",
      featured,
      more: more.slice(0, 3),
    };
  }

  const dayOfYear = Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000,
  );
  const sorted = sortChronologically(all);
  return {
    mode: "archive",
    featured: sorted[dayOfYear % sorted.length],
    more: [],
  };
}

export async function getLinks() {
  return db.select().from(links).orderBy(asc(links.sortOrder));
}

export async function getPillars() {
  return db.select().from(pillars).orderBy(asc(pillars.sortOrder));
}

export async function getFaqs() {
  return db.select().from(faqs).orderBy(asc(faqs.sortOrder));
}
