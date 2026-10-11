import type { Metadata } from "next";
import Link from "next/link";
import { ExecCard } from "@/components/exec-card";
import { PageHeader, SectionHeading } from "@/components/section-heading";
import type { Exec } from "@/db/schema";
import {
  chapterMap,
  getActiveExecs,
  getChapters,
  getPastExecs,
} from "@/lib/queries";
import { toExecCard } from "@/lib/view";

export const metadata: Metadata = {
  title: "Team",
  description: "The executives who run History Before Us and its chapters.",
};

export default async function TeamPage() {
  const [team, pastTeam, chapters] = await Promise.all([
    getActiveExecs(),
    getPastExecs(),
    getChapters(),
  ]);
  const byId = chapterMap(chapters);

  // Organization-wide execs first, then one section per chapter.
  const leadership = team.filter((e) => !e.chapterId || !byId.has(e.chapterId));
  const sections = [
    ...(leadership.length
      ? [
          {
            key: "org",
            title: chapters.length ? "Leadership" : "The team",
            chapter: null,
            execs: leadership,
          },
        ]
      : []),
    ...chapters
      .map((c) => ({
        key: c.id,
        title: `${c.name} chapter`,
        chapter: c,
        execs: team.filter((e) => e.chapterId === c.id),
      }))
      .filter((s) => s.execs.length > 0),
  ];

  const pastByTerm = new Map<string, Exec[]>();
  for (const exec of pastTeam) {
    const term = exec.term || "Earlier";
    pastByTerm.set(term, [...(pastByTerm.get(term) ?? []), exec]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
      <PageHeader eyebrow="The team" title="The people behind the club">
        Students who volunteer their time to plan events, research stories, and
        build community across our chapters.
      </PageHeader>

      {team.length === 0 ? (
        <p className="font-serif text-2xl text-muted">
          Team profiles coming soon.
        </p>
      ) : (
        <div className="space-y-20">
          {sections.map((section) => (
            <section key={section.key}>
              {sections.length > 1 && (
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
                  <h2 className="font-serif text-3xl">{section.title}</h2>
                  {section.chapter && (
                    <Link
                      href={`/chapters/${section.chapter.slug}`}
                      className="text-sm text-muted hover:text-accent"
                    >
                      {[section.chapter.institution, section.chapter.city]
                        .filter(Boolean)
                        .join(" · ") || "About this chapter"}{" "}
                      →
                    </Link>
                  )}
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {section.execs.map((exec) => (
                  <ExecCard key={exec.id} exec={toExecCard(exec)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {pastByTerm.size > 0 && (
        <section className="mt-28">
          <SectionHeading eyebrow="With thanks" title="Past executives" />
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {[...pastByTerm].map(([term, execs]) => (
              <div key={term}>
                <p className="mb-3 font-serif text-xl text-accent">{term}</p>
                <ul className="divide-y divide-line border-y border-line">
                  {execs.map((exec) => (
                    <li
                      key={exec.id}
                      className="flex justify-between gap-4 py-2.5 text-sm"
                    >
                      <span className="font-medium">{exec.name}</span>
                      <span className="text-right text-muted">
                        {exec.role}
                        {exec.chapterId && byId.get(exec.chapterId)
                          ? ` · ${byId.get(exec.chapterId)!.name}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
