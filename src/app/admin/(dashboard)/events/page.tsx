import Link from "next/link";
import { desc } from "drizzle-orm";
import { ChevronRight, Plus } from "lucide-react";
import { db } from "@/db";
import { chapters, events } from "@/db/schema";
import { dateBlock, formatTime, zonedParts } from "@/lib/format";
import { isPast } from "@/lib/queries";
import {
  AdminPageHeader,
  Badge,
  buttonClass,
  EmptyState,
} from "../../_components/ui";

const TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "drafts", label: "Drafts" },
] as const;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.key === tabParam)?.key ?? "upcoming";
  const [all, chapterList] = await Promise.all([
    db.select().from(events).orderBy(desc(events.eventDate)),
    db.select({ id: chapters.id, name: chapters.name }).from(chapters),
  ]);
  const chapterName = new Map(chapterList.map((c) => [c.id, c.name]));

  const groups = {
    upcoming: all.filter((e) => e.published && !isPast(e)).reverse(),
    past: all.filter((e) => e.published && isPast(e)),
    drafts: all.filter((e) => !e.published),
  };
  const list = groups[tab];

  return (
    <>
      <AdminPageHeader
        title="Events"
        description="Everything on the public events page. Past events stay in the archive — add a recap after each one."
        actions={
          <Link href="/admin/events/new" className={buttonClass.primary}>
            <Plus className="size-4" /> New event
          </Link>
        }
      />

      <div className="mb-5 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/events?tab=${t.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              tab === t.key
                ? "border-accent font-medium text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}{" "}
            <span className="text-xs text-muted">({groups[t.key].length})</span>
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={
            tab === "upcoming"
              ? "No upcoming events"
              : tab === "past"
                ? "No past events yet"
                : "No drafts"
          }
        >
          {tab === "upcoming" && (
            <Link
              href="/admin/events/new"
              className="text-accent hover:underline"
            >
              Add the next one →
            </Link>
          )}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {list.map((event) => {
            const d = dateBlock(event.eventDate);
            return (
              <li key={event.id}>
                <Link
                  href={`/admin/events/${event.id}`}
                  className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-paper/60"
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="eyebrow text-[10px] text-accent">{d.month}</p>
                    <p className="font-serif text-2xl leading-none">{d.day}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{event.title}</p>
                    <p className="truncate text-sm text-muted">
                      {zonedParts(event.eventDate).year} ·{" "}
                      {formatTime(event.eventDate, event.endsAt)}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                  <div className="hidden shrink-0 gap-1.5 sm:flex">
                    {event.chapterId && chapterName.get(event.chapterId) && (
                      <Badge>{chapterName.get(event.chapterId)}</Badge>
                    )}
                    {!event.published && <Badge tone="warning">Draft</Badge>}
                    {isPast(event) && event.published && !event.recap && (
                      <Badge tone="accent">Needs recap</Badge>
                    )}
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-ink/30" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
