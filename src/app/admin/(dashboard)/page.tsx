import Link from "next/link";
import { asc } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ScrollText,
  UserPlus,
} from "lucide-react";
import { db } from "@/db";
import { chapters, events, execs, facts, links } from "@/db/schema";
import { dateBlock, formatTime, MONTH_NAMES, today } from "@/lib/format";
import { isPast } from "@/lib/queries";
import { AdminPageHeader, Panel } from "../_components/ui";

export default async function AdminDashboard() {
  const [eventRows, execRows, factRows, chapterRows, linkRows] =
    await Promise.all([
      db.select().from(events).orderBy(asc(events.eventDate)),
      db.select().from(execs),
      db.select().from(facts),
      db.select().from(chapters),
      db.select({ id: links.id }).from(links),
    ]);
  const { month } = today();
  const nextMonth = (month % 12) + 1;
  const monthName = MONTH_NAMES[month - 1];

  const upcoming = eventRows.filter((e) => e.published && !isPast(e));
  const needsRecap = eventRows.filter(
    (e) => e.published && isPast(e) && !e.recap,
  );
  const drafts = eventRows.filter((e) => !e.published);
  const activeExecs = execRows.filter((e) => e.active);
  const factsThisMonth = factRows.filter(
    (f) => f.published && f.month === month,
  );
  const factsNextMonth = factRows.filter(
    (f) => f.published && f.month === nextMonth,
  );

  const todos: { text: string; href: string }[] = [];
  if (upcoming.length === 0) {
    todos.push({
      text: "No upcoming events — the home page events section is hidden.",
      href: "/admin/events/new",
    });
  }
  if (factsThisMonth.length === 0) {
    todos.push({
      text: `No history facts for ${monthName} — the home page is showing one from another month.`,
      href: `/admin/facts/new?month=${month}`,
    });
  }
  if (factsNextMonth.length === 0) {
    todos.push({
      text: `Nothing ready for ${MONTH_NAMES[nextMonth - 1]} yet. Get ahead by adding a fact or two.`,
      href: `/admin/facts/new?month=${nextMonth}`,
    });
  }
  const noPhoto = activeExecs.filter((e) => !e.photoId).length;
  if (noPhoto > 0) {
    todos.push({
      text: `${noPhoto} exec${noPhoto === 1 ? " is" : "s are"} missing a headshot.`,
      href: "/admin/team",
    });
  }
  const incomplete = activeExecs.filter((e) => !e.bio || !e.program).length;
  if (incomplete > 0) {
    todos.push({
      text: `${incomplete} profile${incomplete === 1 ? " is" : "s are"} missing a bio or program.`,
      href: "/admin/team",
    });
  }
  if (needsRecap.length > 0) {
    todos.push({
      text: `${needsRecap.length} past event${needsRecap.length === 1 ? " needs" : "s need"} a recap for the archive.`,
      href: "/admin/events?tab=past",
    });
  }
  if (linkRows.length === 0) {
    todos.push({
      text: "No contact or social links — visitors have no way to reach you.",
      href: "/admin/content#links",
    });
  }
  if (chapterRows.length === 0) {
    todos.push({
      text: "No chapters set up yet.",
      href: "/admin/chapters/new",
    });
  }

  const stats = [
    { label: "Upcoming events", value: upcoming.length, href: "/admin/events" },
    {
      label: `Facts in ${monthName}`,
      value: factsThisMonth.length,
      href: `/admin/facts?month=${month}`,
    },
    { label: "Current execs", value: activeExecs.length, href: "/admin/team" },
    { label: "Chapters", value: chapterRows.length, href: "/admin/chapters" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Welcome back"
        description="Here's what's on the website right now, and what could use some attention."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-line bg-card p-4 transition hover:border-ink/25"
          >
            <p className="font-serif text-4xl">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="To do">
          {todos.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" /> Everything looks great. Nice
              work!
            </p>
          ) : (
            <ul className="-my-1 divide-y divide-line">
              {todos.map((todo) => (
                <li key={todo.text}>
                  <Link
                    href={todo.href}
                    className="group flex items-start gap-3 py-3 text-sm"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <span className="flex-1">{todo.text}</span>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Quick add">
            <div className="grid gap-2">
              {[
                {
                  href: "/admin/events/new",
                  label: "New event",
                  icon: CalendarPlus,
                },
                {
                  href: `/admin/facts/new?month=${month}`,
                  label: "New history fact",
                  icon: ScrollText,
                },
                {
                  href: "/admin/team/new",
                  label: "New team member",
                  icon: UserPlus,
                },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
                >
                  <Icon className="size-4" /> {label}
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Coming up">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted">Nothing scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.slice(0, 4).map((event) => {
                  const d = dateBlock(event.eventDate);
                  return (
                    <li key={event.id}>
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="flex items-center gap-3 hover:text-accent"
                      >
                        <div className="w-10 shrink-0 rounded-md border border-line bg-paper py-1 text-center">
                          <p className="text-[10px] font-semibold uppercase text-accent">
                            {d.month}
                          </p>
                          <p className="font-serif text-lg leading-none">
                            {d.day}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted">
                            {formatTime(event.eventDate)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {drafts.length > 0 && (
              <Link
                href="/admin/events?tab=drafts"
                className="mt-4 block text-xs text-muted hover:text-ink"
              >
                + {drafts.length} draft{drafts.length === 1 ? "" : "s"}
              </Link>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
