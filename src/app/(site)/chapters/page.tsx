import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { excerpt } from "@/components/markdown";
import { Portrait } from "@/components/portrait";
import { PageHeader } from "@/components/section-heading";
import { getActiveExecs, getChapters, getUpcomingEvents } from "@/lib/queries";
import { imageUrl } from "@/lib/view";

export const metadata: Metadata = {
  title: "Chapters",
  description: "Find a History Before Us chapter near you.",
};

export default async function ChaptersPage() {
  const [chapters, team, upcoming] = await Promise.all([
    getChapters(),
    getActiveExecs(),
    getUpcomingEvents(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
      <PageHeader eyebrow="Chapters" title="Find your chapter">
        History Before Us is growing. Each chapter runs its own events while
        sharing one mission: making history local, personal, and open to all.
      </PageHeader>

      {chapters.length === 0 ? (
        <p className="font-serif text-2xl text-muted">Chapters coming soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {chapters.map((chapter) => {
            const execs = team.filter((e) => e.chapterId === chapter.id);
            const eventCount = upcoming.filter(
              (e) => e.chapterId === chapter.id,
            ).length;
            return (
              <Link
                key={chapter.id}
                href={`/chapters/${chapter.slug}`}
                className="group flex flex-col rounded-2xl border border-line bg-card p-7 transition hover:border-accent/50 hover:shadow-sm sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-3xl group-hover:text-accent">
                      {chapter.name}
                    </h2>
                    {(chapter.institution || chapter.city) && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                        <MapPin className="size-3.5" />
                        {[chapter.institution, chapter.city]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-2 size-5 text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                </div>
                {chapter.description && (
                  <p className="mt-5 leading-relaxed text-ink/75">
                    {excerpt(chapter.description, 200)}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                  <div className="flex -space-x-2">
                    {execs.slice(0, 5).map((exec) => (
                      <Portrait
                        key={exec.id}
                        name={exec.name}
                        photoUrl={imageUrl(exec.photoId)}
                        className="size-9 rounded-full ring-2 ring-card"
                        textClassName="text-xs"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted">
                    {eventCount > 0
                      ? `${eventCount} upcoming event${eventCount === 1 ? "" : "s"}`
                      : `${execs.length} exec${execs.length === 1 ? "" : "s"}`}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
