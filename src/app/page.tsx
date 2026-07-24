import Link from "next/link";
import { asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { events, facts } from "@/db/schema";
import { formatEventDate } from "@/lib/format";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default async function HomePage() {
  const currentMonth = new Date().getMonth() + 1;

  const [content, upcoming, monthlyFacts] = await Promise.all([
    getSiteContent(),
    db
      .select()
      .from(events)
      .where(gte(events.eventDate, new Date()))
      .orderBy(asc(events.eventDate))
      .limit(3),
    db
      .select()
      .from(facts)
      .where(eq(facts.month, currentMonth))
      .orderBy(asc(facts.createdAt)),
  ]);

  const hasContact =
    content.contact_email ||
    content.contact_instagram ||
    content.contact_discord ||
    content.meeting_info;

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          History Before Us
        </h1>
        <p className="max-w-2xl text-lg text-black/70">{content.intro}</p>
        <div className="flex gap-4">
          <Link
            href="/events"
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            See upcoming events
          </Link>
          <Link
            href="/execs"
            className="rounded-md border border-black/15 px-5 py-2.5 text-sm font-medium hover:bg-black/5"
          >
            Meet the team
          </Link>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-3">
        <Feature
          title="The land we live on"
          body="Local and Indigenous history of the place our campus sits on."
        />
        <Feature
          title="World history"
          body="From ancient empires to the modern era, told through events and discussion."
        />
        <Feature
          title="Open to all"
          body="Come as you are. Membership is free and everyone is welcome."
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Upcoming events
          </h2>
          <Link href="/events" className="text-sm text-accent hover:underline">
            See all events
          </Link>
        </div>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          This month in history: {MONTH_NAMES[currentMonth - 1]}
        </h2>
        {monthlyFacts.length === 0 ? (
          <p className="text-black/60">
            No facts for this month yet — check back soon.
          </p>
        ) : (
          <ul className="space-y-3">
            {monthlyFacts.map((fact) => (
              <li
                key={fact.id}
                className="rounded-lg border border-black/10 bg-white/50 p-4"
              >
                <p className="text-sm text-black/80">{fact.fact}</p>
                {fact.source && (
                  <p className="mt-1 text-xs text-black/50">{fact.source}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
        {!hasContact ? (
          <p className="text-black/60">Contact info coming soon.</p>
        ) : (
          <ul className="space-y-2 text-sm text-black/70">
            {content.contact_email && (
              <li>
                Email:{" "}
                <a
                  href={`mailto:${content.contact_email}`}
                  className="text-accent hover:underline"
                >
                  {content.contact_email}
                </a>
              </li>
            )}
            {content.contact_instagram && (
              <li>Instagram: {content.contact_instagram}</li>
            )}
            {content.contact_discord && (
              <li>Discord: {content.contact_discord}</li>
            )}
            {content.meeting_info && <li>{content.meeting_info}</li>}
          </ul>
        )}
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-accent">{title}</h2>
      <p className="text-sm text-black/70">{body}</p>
    </div>
  );
}
