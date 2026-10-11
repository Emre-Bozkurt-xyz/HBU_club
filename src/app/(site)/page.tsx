import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { EventCard, EventSpotlight } from "@/components/event-card";
import { FactFeature, FactSnippet } from "@/components/fact-card";
import { HeroSeal } from "@/components/logo";
import { Markdown } from "@/components/markdown";
import { Portrait } from "@/components/portrait";
import { SectionHeading } from "@/components/section-heading";
import { SocialIcon } from "@/components/social-icon";
import { linkDisplay, linkHref, PLATFORMS, type Platform } from "@/lib/links";
import {
  chapterMap,
  getActiveExecs,
  getChapters,
  getFaqs,
  getFeaturedFacts,
  getLinks,
  getPillars,
  getUpcomingEvents,
  imageUrl,
} from "@/lib/queries";
import { getSiteContent } from "@/lib/site-content";
import { toEventCard as toCard, toFactCard } from "@/lib/view";

export default async function HomePage() {
  const [content, upcoming, featured, chapters, team, pillars, faqs, links] =
    await Promise.all([
      getSiteContent(),
      getUpcomingEvents({ limit: 4 }),
      getFeaturedFacts(),
      getChapters(),
      getActiveExecs(),
      getPillars(),
      getFaqs(),
      getLinks(),
    ]);
  const byId = chapterMap(chapters);
  const [nextEvent, ...laterEvents] = upcoming;
  const joinHref = content.join_url || "#join";

  return (
    <>
      {/* Hero */}
      <section className="paper-grain border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-accent">{content.hero_eyebrow}</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">
              {content.hero_heading}
            </h1>
            <Markdown className="mt-7 max-w-2xl text-lg leading-relaxed text-ink/75 sm:text-xl">
              {content.intro}
            </Markdown>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={joinHref}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-ink"
              >
                Join us <ArrowRight className="size-4" aria-hidden />
              </a>
              <Link
                href="/events"
                className="inline-flex items-center rounded-full border border-ink/20 bg-card/60 px-6 py-3 font-medium transition hover:border-ink"
              >
                See upcoming events
              </Link>
            </div>
            {chapters.length > 0 && (
              <p className="mt-12 text-sm text-muted">
                Chapters at{" "}
                {chapters.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && (i === chapters.length - 1 ? " and " : ", ")}
                    <Link
                      href={`/chapters/${c.slug}`}
                      className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent"
                    >
                      {c.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
          <HeroSeal className="hidden w-80 lg:block xl:w-96" />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-24 px-4 pt-20 sm:space-y-32 sm:px-6">
        {/* Events */}
        {nextEvent && (
          <section>
            <SectionHeading
              eyebrow="What's on"
              title="Upcoming events"
              action={{ href: "/events", label: "All events" }}
            />
            <EventSpotlight event={toCard(nextEvent, byId)} />
            {laterEvents.length > 0 && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {laterEvents.slice(0, 2).map((event) => (
                  <EventCard key={event.id} event={toCard(event, byId)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* History */}
        {featured && (
          <section>
            <SectionHeading
              eyebrow="Today in history"
              title="A moment worth remembering"
              action={{ href: "/history", label: "Explore the timeline" }}
            />
            <FactFeature
              mode={featured.mode}
              fact={toFactCard(featured.featured)}
            />
            {featured.more.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {featured.more.map((fact) => (
                  <FactSnippet key={fact.id} fact={toFactCard(fact)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* What we do */}
        {pillars.length > 0 && (
          <section>
            <SectionHeading eyebrow="What we do" title="History, together" />
            <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
              {pillars.map((pillar, i) => (
                <div key={pillar.id} className="bg-card p-7 sm:p-8">
                  <p className="font-serif text-4xl text-gold">
                    {["I", "II", "III", "IV", "V", "VI"][i] ?? i + 1}
                  </p>
                  <h3 className="mt-4 font-serif text-2xl">{pillar.title}</h3>
                  <Markdown className="mt-3 leading-relaxed text-ink/75">
                    {pillar.body}
                  </Markdown>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Team */}
        {team.length > 0 && (
          <section>
            <SectionHeading
              eyebrow="The people"
              title="Meet the team"
              action={{ href: "/team", label: "Full team" }}
            />
            <div className="flex flex-wrap gap-x-6 gap-y-8">
              {team.slice(0, 8).map((exec) => (
                <Link
                  key={exec.id}
                  href="/team"
                  className="group w-28 text-center sm:w-32"
                >
                  <Portrait
                    name={exec.name}
                    photoUrl={imageUrl(exec.photoId)}
                    className="mx-auto size-24 rounded-full ring-1 ring-line transition group-hover:ring-2 group-hover:ring-accent sm:size-28"
                    textClassName="text-2xl"
                  />
                  <p className="mt-3 text-sm font-medium leading-tight">
                    {exec.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{exec.role}</p>
                </Link>
              ))}
              {team.length > 8 && (
                <Link href="/team" className="group w-28 text-center sm:w-32">
                  <div className="mx-auto flex size-24 items-center justify-center rounded-full border border-dashed border-ink/25 text-muted transition group-hover:border-accent group-hover:text-accent sm:size-28">
                    <Plus className="size-5" />
                    <span className="text-lg">{team.length - 8}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium">See everyone</p>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="grid gap-10 md:grid-cols-[1fr_1.6fr]">
            <div>
              <SectionHeading eyebrow="Questions" title="Good to know" />
            </div>
            <div className="divide-y divide-line border-y border-line">
              {faqs.map((faq) => (
                <details key={faq.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif text-xl [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <Plus
                      className="size-5 shrink-0 text-accent transition group-open:rotate-45"
                      aria-hidden
                    />
                  </summary>
                  <Markdown className="mt-3 leading-relaxed text-ink/75">
                    {faq.answer}
                  </Markdown>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Join */}
        <section
          id="join"
          className="scroll-mt-24 overflow-hidden rounded-3xl border border-line bg-paper-deep"
        >
          <div className="grid gap-10 p-8 sm:p-12 md:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="eyebrow text-accent">Get involved</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Come make history with us.
              </h2>
              <Markdown className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">
                {content.join_text}
              </Markdown>
              {content.join_url && (
                <a
                  href={content.join_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-ink"
                >
                  Sign up <ArrowRight className="size-4" aria-hidden />
                </a>
              )}
            </div>
            <div className="space-y-6">
              {links.length > 0 && (
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={linkHref(link.platform, link.url)}
                        target={
                          link.platform === "email" ? undefined : "_blank"
                        }
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 transition hover:border-accent"
                      >
                        <SocialIcon
                          platform={link.platform}
                          className="size-5 text-accent"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs text-muted">
                            {link.label ||
                              PLATFORMS[link.platform as Platform]?.label ||
                              link.platform}
                          </span>
                          <span className="block truncate font-medium">
                            {linkDisplay(link.platform, link.url)}
                          </span>
                        </span>
                        <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {content.meeting_info && (
                <div className="rounded-xl border border-line bg-card px-5 py-4">
                  <p className="eyebrow text-muted">Where we meet</p>
                  <Markdown className="mt-2 text-sm leading-relaxed">
                    {content.meeting_info}
                  </Markdown>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
