import { asc, desc, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { formatEventDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    db
      .select()
      .from(events)
      .where(gte(events.eventDate, now))
      .orderBy(asc(events.eventDate)),
    db
      .select()
      .from(events)
      .where(lt(events.eventDate, now))
      .orderBy(desc(events.eventDate)),
  ]);

  return (
    <div className="space-y-16">
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Upcoming events</h1>
          <p className="text-black/70">
            Dates, themes, and locations for what&apos;s coming up.
          </p>
        </header>

        {upcoming.length === 0 ? (
          <p className="text-black/60">
            No events scheduled right now — check back soon.
          </p>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-black/10 bg-white/50 p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                  {event.theme && (
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {event.theme}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-black/60">
                  {formatEventDate(event.eventDate)}
                  {event.location && <> · {event.location}</>}
                </p>
                {event.description && (
                  <p className="mt-3 text-sm text-black/70">
                    {event.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Past events</h2>
          <p className="text-black/70">A record of what the club has done.</p>
        </header>

        {past.length === 0 ? (
          <p className="text-black/60">No past events yet.</p>
        ) : (
          <ul className="space-y-4">
            {past.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-black/10 bg-white/30 p-5 opacity-80"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  {event.theme && (
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {event.theme}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-black/60">
                  {formatEventDate(event.eventDate)}
                  {event.location && <> · {event.location}</>}
                </p>
                {event.description && (
                  <p className="mt-3 text-sm text-black/70">
                    {event.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
