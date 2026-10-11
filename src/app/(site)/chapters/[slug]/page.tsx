import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, MapPin } from "lucide-react";
import { EventCard, PastEventRow } from "@/components/event-card";
import { ExecCard } from "@/components/exec-card";
import { excerpt, Markdown } from "@/components/markdown";
import { SectionHeading } from "@/components/section-heading";
import { SocialIcon } from "@/components/social-icon";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { linkDisplay, linkHref } from "@/lib/links";
import {
  getActiveExecs,
  getPastEvents,
  getUpcomingEvents,
} from "@/lib/queries";
import { toEventCard, toExecCard } from "@/lib/view";

async function getChapter(slug: string) {
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.slug, slug), eq(chapters.published, true)));
  return chapter ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const chapter = await getChapter((await params).slug);
  if (!chapter) return {};
  return {
    title: `${chapter.name} chapter`,
    description: excerpt(chapter.description, 160) || undefined,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const chapter = await getChapter((await params).slug);
  if (!chapter) notFound();

  const [team, upcoming, past] = await Promise.all([
    getActiveExecs(),
    getUpcomingEvents({ chapterId: chapter.id }),
    getPastEvents({ chapterId: chapter.id }),
  ]);
  const execs = team.filter((e) => e.chapterId === chapter.id);
  const contacts = (
    [
      ["email", chapter.email],
      ["instagram", chapter.instagram],
    ] as const
  ).filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <Link
        href="/chapters"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> All chapters
      </Link>

      <header className="mt-8 grid gap-10 border-b border-line pb-14 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="eyebrow text-accent">Chapter</p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] sm:text-6xl">
            {chapter.name}
          </h1>
          {(chapter.institution || chapter.city) && (
            <p className="mt-4 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" />
              {[chapter.institution, chapter.city].filter(Boolean).join(" · ")}
            </p>
          )}
          <Markdown className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/80">
            {chapter.description}
          </Markdown>
        </div>
        {(contacts.length > 0 || chapter.meetingInfo) && (
          <aside className="space-y-3 self-start rounded-2xl border border-line bg-card p-6">
            <p className="eyebrow text-muted">Get in touch</p>
            {contacts.map(([platform, value]) => (
              <a
                key={platform}
                href={linkHref(platform, value!)}
                target={platform === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-3 font-medium hover:text-accent"
              >
                <SocialIcon
                  platform={platform}
                  className="size-5 text-accent"
                />
                {linkDisplay(platform, value!)}
              </a>
            ))}
            {chapter.meetingInfo && (
              <div className="border-t border-line pt-3">
                <p className="eyebrow text-muted">Where we meet</p>
                <Markdown className="mt-2 text-sm leading-relaxed">
                  {chapter.meetingInfo}
                </Markdown>
              </div>
            )}
          </aside>
        )}
      </header>

      <div className="mt-16 space-y-24">
        <section>
          <SectionHeading eyebrow="What's on" title="Upcoming events" />
          {upcoming.length === 0 ? (
            <p className="text-muted">
              No events scheduled right now — check back soon.
            </p>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={toEventCard(event)} />
              ))}
            </div>
          )}
        </section>

        {execs.length > 0 && (
          <section>
            <SectionHeading eyebrow="The people" title="Chapter team" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {execs.map((exec) => (
                <ExecCard key={exec.id} exec={toExecCard(exec)} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <SectionHeading eyebrow="The archive" title="Past events" />
            <div className="border-b border-line">
              {past.slice(0, 10).map((event) => (
                <PastEventRow key={event.id} event={toEventCard(event)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
