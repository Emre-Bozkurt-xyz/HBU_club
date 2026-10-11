import Link from "next/link";
import { asc } from "drizzle-orm";
import { ChevronRight, Plus } from "lucide-react";
import { db } from "@/db";
import { chapters, events, execs } from "@/db/schema";
import {
  AdminPageHeader,
  Badge,
  buttonClass,
  EmptyState,
  ReorderButtons,
} from "../../_components/ui";
import { moveChapter } from "./actions";

export default async function AdminChaptersPage() {
  const [list, execRows, eventRows] = await Promise.all([
    db
      .select()
      .from(chapters)
      .orderBy(asc(chapters.sortOrder), asc(chapters.name)),
    db.select({ chapterId: execs.chapterId, active: execs.active }).from(execs),
    db.select({ chapterId: events.chapterId }).from(events),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Chapters"
        description="Each chapter gets its own public page with its team, events, and contact info."
        actions={
          <Link href="/admin/chapters/new" className={buttonClass.primary}>
            <Plus className="size-4" /> New chapter
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState title="No chapters yet">
          Without chapters, everything shows as organization-wide.{" "}
          <Link
            href="/admin/chapters/new"
            className="text-accent hover:underline"
          >
            Add the first chapter →
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {list.map((chapter, i) => {
            const execCount = execRows.filter(
              (e) => e.chapterId === chapter.id && e.active,
            ).length;
            const eventCount = eventRows.filter(
              (e) => e.chapterId === chapter.id,
            ).length;
            return (
              <li
                key={chapter.id}
                className="flex items-center gap-2 pl-2 pr-4"
              >
                <ReorderButtons
                  action={moveChapter}
                  id={chapter.id}
                  first={i === 0}
                  last={i === list.length - 1}
                />
                <Link
                  href={`/admin/chapters/${chapter.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{chapter.name}</p>
                    <p className="truncate text-sm text-muted">
                      {[chapter.institution, chapter.city]
                        .filter(Boolean)
                        .join(" · ") || `/chapters/${chapter.slug}`}
                    </p>
                  </div>
                  <div className="hidden shrink-0 gap-1.5 sm:flex">
                    <Badge>{execCount} execs</Badge>
                    <Badge>{eventCount} events</Badge>
                    {!chapter.published && <Badge tone="warning">Hidden</Badge>}
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
