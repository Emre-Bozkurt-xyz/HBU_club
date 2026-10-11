import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2 text-accent">{eyebrow}</p>}
        <h2 className="font-serif text-3xl leading-tight sm:text-4xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
        >
          {action.label}
          <ArrowRight
            className="size-4 transition group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}

/** Page header used at the top of every public sub-page. */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-12 max-w-3xl">
      {eyebrow && <p className="eyebrow mb-3 text-accent">{eyebrow}</p>}
      <h1 className="font-serif text-4xl leading-[1.05] sm:text-6xl">
        {title}
      </h1>
      {children && (
        <div className="mt-5 text-lg leading-relaxed text-ink/75">
          {children}
        </div>
      )}
    </header>
  );
}

/** Pill-style filter link. */
export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-card text-ink/80 hover:border-ink/40"
      }`}
    >
      {children}
    </Link>
  );
}
