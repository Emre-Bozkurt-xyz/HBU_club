import Link from "next/link";
import { asc } from "drizzle-orm";
import { ChevronRight, Plus } from "lucide-react";
import { Portrait } from "@/components/portrait";
import { db } from "@/db";
import { chapters, execs, type Exec } from "@/db/schema";
import { imageUrl } from "@/lib/view";
import {
  AdminPageHeader,
  Badge,
  buttonClass,
  EmptyState,
  ReorderButtons,
} from "../../_components/ui";
import { moveExec } from "./actions";

function ExecRows({ list }: { list: Exec[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
      {list.map((exec, i) => (
        <li key={exec.id} className="flex items-center gap-2 pl-2 pr-4">
          <ReorderButtons
            action={moveExec}
            id={exec.id}
            first={i === 0}
            last={i === list.length - 1}
          />
          <Link
            href={`/admin/team/${exec.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 py-3"
          >
            <Portrait
              name={exec.name}
              photoUrl={imageUrl(exec.photoId)}
              className="size-11 shrink-0 rounded-full"
              textClassName="text-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {exec.name}
                {exec.pronouns && (
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    ({exec.pronouns})
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted">
                {[exec.role, exec.program, exec.year]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="hidden shrink-0 gap-1.5 sm:flex">
              {!exec.photoId && <Badge tone="warning">No photo</Badge>}
              {!exec.bio && <Badge tone="warning">No bio</Badge>}
              {!exec.active && exec.term && <Badge>{exec.term}</Badge>}
            </div>
            <ChevronRight className="size-4 shrink-0 text-ink/30" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminTeamPage() {
  const [all, chapterList] = await Promise.all([
    db.select().from(execs).orderBy(asc(execs.sortOrder), asc(execs.createdAt)),
    db.select().from(chapters).orderBy(asc(chapters.sortOrder)),
  ]);
  const current = all.filter((e) => e.active);
  const past = all.filter((e) => !e.active);
  const knownChapters = new Set(chapterList.map((c) => c.id));

  const groups = [
    {
      key: "org",
      title: "Leadership (organization-wide)",
      list: current.filter(
        (e) => !e.chapterId || !knownChapters.has(e.chapterId),
      ),
    },
    ...chapterList.map((c) => ({
      key: c.id,
      title: `${c.name} chapter`,
      list: current.filter((e) => e.chapterId === c.id),
    })),
  ].filter((g) => g.list.length > 0);

  return (
    <>
      <AdminPageHeader
        title="Team"
        description="Exec profiles shown on the Team page. Use the arrows to change the order people appear in."
        actions={
          <Link href="/admin/team/new" className={buttonClass.primary}>
            <Plus className="size-4" /> Add person
          </Link>
        }
      />

      {all.length === 0 ? (
        <EmptyState title="No one here yet">
          <Link href="/admin/team/new" className="text-accent hover:underline">
            Add the first exec →
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key}>
              <h2 className="mb-2.5 text-sm font-semibold text-ink/70">
                {g.title}
              </h2>
              <ExecRows list={g.list} />
            </section>
          ))}
          {past.length > 0 && (
            <section>
              <h2 className="mb-2.5 text-sm font-semibold text-ink/70">
                Past executives
              </h2>
              <ExecRows list={past} />
            </section>
          )}
        </div>
      )}
    </>
  );
}
