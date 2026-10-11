import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import {
  dateBlock,
  formatLongDate,
  formatShortDate,
  formatTime,
} from "@/lib/format";
import { excerpt } from "./markdown";

export type EventCardData = {
  title: string;
  theme: string | null;
  location: string | null;
  eventDate: Date;
  endsAt: Date | null;
  description: string | null;
  recap?: string | null;
  rsvpUrl: string | null;
  imageUrl: string | null;
  chapterName?: string | null;
  href?: string;
};

export function DateBlock({
  date,
  size = "md",
}: {
  date: Date;
  size?: "md" | "lg";
}) {
  const d = dateBlock(date);
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-paper text-center ${
        size === "lg" ? "w-24 py-4" : "w-[4.5rem] py-3"
      }`}
    >
      <span className="eyebrow text-accent">{d.month}</span>
      <span
        className={`font-serif leading-none ${size === "lg" ? "text-5xl" : "text-4xl"}`}
      >
        {d.day}
      </span>
      <span className="mt-1 text-xs text-muted">{d.weekday}</span>
    </div>
  );
}

function Tags({ event }: { event: EventCardData }) {
  if (!event.theme && !event.chapterName) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {event.theme && (
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {event.theme}
        </span>
      )}
      {event.chapterName && (
        <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted">
          {event.chapterName}
        </span>
      )}
    </div>
  );
}

function When({ event }: { event: EventCardData }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5" aria-hidden />
        {formatTime(event.eventDate, event.endsAt)}
      </span>
      {event.location && (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" aria-hidden />
          {event.location}
        </span>
      )}
    </div>
  );
}

function MaybeLink({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

/** Standard upcoming-event card. */
export function EventCard({ event }: { event: EventCardData }) {
  return (
    <div className="@container">
      <MaybeLink
        href={event.href}
        className="group flex gap-4 rounded-xl border border-line bg-card p-4 transition hover:border-accent/40 hover:shadow-sm @md:gap-5 @md:p-5"
      >
        <DateBlock date={event.eventDate} />
        <div className="min-w-0 flex-1 space-y-2">
          <Tags event={event} />
          <h3 className="font-serif text-xl leading-snug group-hover:text-accent">
            {event.title || "Event title"}
          </h3>
          <When event={event} />
          {event.description && (
            <p className="text-sm leading-relaxed text-ink/75">
              {excerpt(event.description, 160)}
            </p>
          )}
        </div>
        {event.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            className="hidden h-28 w-40 shrink-0 rounded-lg object-cover @xl:block"
          />
        )}
      </MaybeLink>
    </div>
  );
}

/** Large card for the next event on the home page. */
export function EventSpotlight({ event }: { event: EventCardData }) {
  return (
    <div className="@container">
      <article className="overflow-hidden rounded-2xl border border-line bg-card @3xl:grid @3xl:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-56 bg-paper-deep">
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={event.imageUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="paper-grain absolute inset-0 flex items-center justify-center">
              <DateBlock date={event.eventDate} size="lg" />
            </div>
          )}
          <span className="eyebrow absolute left-4 top-4 rounded-full bg-night px-3 py-1.5 text-night-ink">
            Next up
          </span>
        </div>
        <div className="flex flex-col gap-4 p-6 @md:p-8">
          <Tags event={event} />
          <div>
            <p className="text-sm font-medium text-accent">
              {formatLongDate(event.eventDate)}
            </p>
            <h3 className="mt-1 font-serif text-3xl leading-tight">
              {event.title || "Event title"}
            </h3>
          </div>
          <When event={event} />
          {event.description && (
            <p className="leading-relaxed text-ink/75">
              {excerpt(event.description, 260)}
            </p>
          )}
          <div className="mt-auto flex flex-wrap gap-3 pt-2">
            {event.rsvpUrl && (
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-ink"
              >
                RSVP <ArrowUpRight className="size-4" aria-hidden />
              </a>
            )}
            {event.href && (
              <Link
                href={event.href}
                className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:border-ink"
              >
                Details
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

/** Compact row for the past-events archive. */
export function PastEventRow({ event }: { event: EventCardData }) {
  return (
    <div className="@container">
      <MaybeLink
        href={event.href}
        className="group grid gap-1 border-t border-line py-5 @lg:grid-cols-[10rem_1fr] @lg:gap-6"
      >
        <p className="text-sm text-muted">{formatShortDate(event.eventDate)}</p>
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg group-hover:text-accent">
            {event.title}
            {event.chapterName && (
              <span className="ml-2 font-sans text-xs font-medium text-muted">
                {event.chapterName}
              </span>
            )}
          </h3>
          {(event.recap || event.description) && (
            <p className="text-sm leading-relaxed text-ink/70">
              {excerpt(event.recap || event.description, 200)}
            </p>
          )}
        </div>
      </MaybeLink>
    </div>
  );
}
