import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  Clock,
  MapPin,
} from "lucide-react";
import { DateBlock } from "@/components/event-card";
import { excerpt, Markdown } from "@/components/markdown";
import { db } from "@/db";
import { chapters, events } from "@/db/schema";
import { formatLongDate, formatTime } from "@/lib/format";
import { imageUrl, isPast } from "@/lib/queries";

const UUID = /^[0-9a-f-]{36}$/i;

async function getEvent(id: string) {
  if (!UUID.test(id)) return null;
  const [row] = await db
    .select({ event: events, chapter: chapters })
    .from(events)
    .leftJoin(chapters, eq(events.chapterId, chapters.id))
    .where(and(eq(events.id, id), eq(events.published, true)));
  return row ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const row = await getEvent((await params).id);
  if (!row) return {};
  const description = excerpt(row.event.description, 160) || undefined;
  const image = imageUrl(row.event.imageId);
  return {
    title: row.event.title,
    description,
    openGraph: {
      title: row.event.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const row = await getEvent((await params).id);
  if (!row) notFound();
  const { event, chapter } = row;
  const past = isPast(event);
  const cover = imageUrl(event.imageId);

  return (
    <article className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> All events
      </Link>

      <header className="mt-8 flex gap-6">
        <div className="hidden sm:block">
          <DateBlock date={event.eventDate} size="lg" />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {past && (
              <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-medium">
                Past event
              </span>
            )}
            {event.theme && (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {event.theme}
              </span>
            )}
            {chapter && (
              <Link
                href={`/chapters/${chapter.slug}`}
                className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted hover:border-ink"
              >
                {chapter.name} chapter
              </Link>
            )}
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] sm:text-5xl">
            {event.title}
          </h1>
          <div className="space-y-1.5 text-ink/80">
            <p className="font-medium">{formatLongDate(event.eventDate)}</p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <Clock className="size-4" />{" "}
              {formatTime(event.eventDate, event.endsAt)}
            </p>
            {event.location && (
              <p className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="size-4" /> {event.location}
              </p>
            )}
          </div>
          {!past && (
            <div className="flex flex-wrap gap-3 pt-2">
              {event.rsvpUrl && (
                <a
                  href={event.rsvpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-ink"
                >
                  RSVP <ArrowUpRight className="size-4" />
                </a>
              )}
              <a
                href={`/events/${event.id}/ics`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-medium hover:border-ink"
              >
                <CalendarPlus className="size-4" /> Add to calendar
              </a>
            </div>
          )}
        </div>
      </header>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="mt-10 max-h-[28rem] w-full rounded-2xl object-cover"
        />
      )}

      <div className="mt-10 max-w-2xl space-y-10">
        {past && event.recap && (
          <section className="rounded-2xl border border-line bg-card p-6 sm:p-8">
            <p className="eyebrow text-accent">How it went</p>
            <Markdown className="mt-3 text-lg leading-relaxed text-ink/85">
              {event.recap}
            </Markdown>
          </section>
        )}
        <Markdown className="text-lg leading-relaxed text-ink/85">
          {event.description}
        </Markdown>
      </div>
    </article>
  );
}
