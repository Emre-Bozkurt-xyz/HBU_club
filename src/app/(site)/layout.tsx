import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { NAV_ITEMS } from "@/components/nav-items";
import { SiteNav } from "@/components/site-nav";
import { SocialIcon } from "@/components/social-icon";
import { linkDisplay, linkHref, PLATFORMS, type Platform } from "@/lib/links";
import { getChapters, getLinks } from "@/lib/queries";
import { getSiteContent } from "@/lib/site-content";

// Pages are cached and refreshed hourly (so "today in history" and the
// upcoming/past split stay current); admin edits refresh them immediately.
export const revalidate = 3600;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [content, links, chapters] = await Promise.all([
    getSiteContent(),
    getLinks(),
    getChapters(),
  ]);
  const joinHref = content.join_url || "/#join";

  return (
    <div className="flex min-h-screen flex-col">
      {content.announcement && (
        <div className="bg-night px-4 py-2.5 text-center text-sm text-night-ink">
          {content.announcement_url ? (
            <a
              href={content.announcement_url}
              className="group inline-flex items-center gap-1.5 hover:text-gold"
            >
              {content.announcement}
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </a>
          ) : (
            content.announcement
          )}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="font-serif text-lg leading-none tracking-tight">
              History Before Us
            </span>
          </Link>
          <SiteNav joinHref={joinHref} />
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 bg-night text-night-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-serif text-xl">History Before Us</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-night-ink/65">
              {content.hero_eyebrow}. Exploring the land we live on and the
              stories that shaped the wider world.
            </p>
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={linkHref(link.platform, link.url)}
                    target={link.platform === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    title={link.label || linkDisplay(link.platform, link.url)}
                    aria-label={
                      PLATFORMS[link.platform as Platform]?.label ??
                      link.platform
                    }
                    className="rounded-full border border-white/15 p-2.5 text-night-ink/80 transition hover:border-gold hover:text-gold"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="eyebrow mb-4 text-night-ink/45">Explore</p>
            <ul className="space-y-2.5 text-sm">
              {[{ href: "/", label: "Home" }, ...NAV_ITEMS].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-night-ink/80 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {chapters.length > 0 && (
            <div>
              <p className="eyebrow mb-4 text-night-ink/45">Chapters</p>
              <ul className="space-y-2.5 text-sm">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/chapters/${chapter.slug}`}
                      className="text-night-ink/80 hover:text-gold"
                    >
                      {chapter.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-night-ink/45 sm:px-6">
            <span>© {new Date().getFullYear()} History Before Us</span>
            <Link href="/admin" className="hover:text-night-ink">
              Exec login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
