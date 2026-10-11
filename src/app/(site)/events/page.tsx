import type { Metadata } from "next";
import { EventCard, PastEventRow } from "@/components/event-card";
import {
  FilterChip,
  PageHeader,
  SectionHeading,
} from "@/components/section-heading";
import type { Event } from "@/db/schema";
import { zonedParts } from "@/lib/format";
import {
  chapterMap,
  getChapters,
  getPastEvents,
  getUpcomingEvents,
} from "@/lib/queries";
import { toEventCard as toCard } from "@/lib/view";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { chapter: chapterSlug } = await searchParams;
  const chapters = await getChapters();
  const selected = chapters.find((c) => c.slug === chapterSlug);
  const [upcoming, past] = await Promise.all([
    getUpcomingEvents({ chapterId: selected?.id }),
    getPastEvents({ chapterId: selected?.id }),
  ]);
  const byId = chapterMap(chapters);

  const pastByYear = new Map<number, Event[]>();
  for (const event of past) {
    const year = zonedParts(event.eventDate).year;
    pastByYear.set(year, [...(pastByYear.get(year) ?? []), event]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
      <PageHeader eyebrow="Events" title="Talks, trivia, walks & more">
        Everything happening across our chapters. Everyone is welcome — no
        history degree required.
      </PageHeader>

      {chapters.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip href="/events" active={!selected}>
            All chapters
          </FilterChip>
          {chapters.map((c) => (
            <FilterChip
              key={c.id}
              href={`/events?chapter=${c.slug}`}
              active={selected?.id === c.id}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      )}

      <section>
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/20 px-6 py-14 text-center">
            <p className="font-serif text-2xl">
              Nothing on the calendar just yet.
            </p>
            <p className="mt-2 text-muted">
              New events are posted here and on our socials — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={toCard(event, byId)} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="The archive" title="Past events" />
          <div className="space-y-12">
            {[...pastByYear].map(([year, list]) => (
              <div key={year}>
                <p className="mb-2 font-serif text-2xl text-accent">{year}</p>
                <div className="border-b border-line">
                  {list.map((event) => (
                    <PastEventRow key={event.id} event={toCard(event, byId)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
