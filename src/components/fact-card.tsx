import { formatHistoricalDate, formatYear, MONTH_NAMES } from "@/lib/format";
import { Markdown } from "./markdown";

export type FactCardData = {
  id?: string;
  title: string | null;
  fact: string;
  year: number | null;
  month: number | null;
  day: number | null;
  region: string | null;
  source: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
};

function Source({ fact, invert }: { fact: FactCardData; invert?: boolean }) {
  if (!fact.source && !fact.sourceUrl) return null;
  const label = fact.source || "Source";
  return (
    <p className={`text-xs ${invert ? "text-night-ink/55" : "text-muted"}`}>
      Source:{" "}
      {fact.sourceUrl ? (
        <a
          href={fact.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gold"
        >
          {label}
        </a>
      ) : (
        label
      )}
    </p>
  );
}

const MODE_LABEL = {
  today: "On this day",
  month: "This month in history",
  archive: "From the archive",
} as const;

/** The big dark "On this day" card on the home page. */
export function FactFeature({
  fact,
  mode,
}: {
  fact: FactCardData;
  mode: keyof typeof MODE_LABEL;
}) {
  const date = formatHistoricalDate(fact);
  const bigYear = fact.year != null ? formatYear(fact.year) : null;
  return (
    <div className="@container">
      <article className="relative overflow-hidden rounded-2xl bg-night text-night-ink">
        <div className="pointer-events-none absolute -right-6 -top-10 select-none whitespace-nowrap font-serif text-[11rem] leading-none text-white/[0.04] @xl:text-[16rem]">
          {bigYear ??
            (fact.month ? MONTH_NAMES[fact.month - 1].slice(0, 3) : "")}
        </div>
        <div className="relative grid gap-8 p-7 @xl:p-10 @3xl:grid-cols-[auto_1fr] @3xl:gap-12">
          <div className="@3xl:w-56">
            <p className="eyebrow text-gold">{MODE_LABEL[mode]}</p>
            {bigYear && (
              <p className="mt-3 font-serif text-6xl leading-none text-gold @xl:text-7xl">
                {bigYear}
              </p>
            )}
            {date && date !== bigYear && (
              <p className="mt-3 text-sm text-night-ink/70">{date}</p>
            )}
            {fact.region && (
              <p className="mt-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs text-night-ink/80">
                {fact.region}
              </p>
            )}
          </div>
          <div className="space-y-4">
            {fact.title && (
              <h3 className="font-serif text-3xl leading-tight @xl:text-4xl">
                {fact.title}
              </h3>
            )}
            <Markdown
              invert
              className={`leading-relaxed text-night-ink/85 ${fact.title ? "text-base" : "font-serif text-2xl"}`}
            >
              {fact.fact || "Fact text"}
            </Markdown>
            {fact.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fact.imageUrl}
                alt=""
                className="max-h-72 w-full rounded-lg object-cover"
              />
            )}
            <Source fact={fact} invert />
          </div>
        </div>
      </article>
    </div>
  );
}

/** Small card used for "more this month" and in admin lists. */
export function FactSnippet({ fact }: { fact: FactCardData }) {
  return (
    <article className="rounded-xl border border-line bg-card p-5">
      <p className="eyebrow text-accent">
        {formatHistoricalDate(fact) || "Undated"}
      </p>
      {fact.title && <h4 className="mt-2 font-serif text-lg">{fact.title}</h4>}
      <Markdown className="mt-2 text-sm leading-relaxed text-ink/80">
        {fact.fact}
      </Markdown>
    </article>
  );
}

/** One entry on the /history timeline. */
export function TimelineEntry({ fact }: { fact: FactCardData }) {
  const dateWithoutYear = formatHistoricalDate({ ...fact, year: null });
  return (
    <article
      id={fact.id}
      className="relative scroll-mt-24 pb-10 pl-8 sm:grid sm:grid-cols-[8.5rem_1fr] sm:gap-8 sm:pl-0"
    >
      <span
        aria-hidden
        className="absolute left-0 top-2 size-3 rounded-full border-2 border-accent bg-paper sm:left-[146px]"
      />
      <div className="sm:pr-6 sm:text-right">
        <p className="font-serif text-2xl leading-none text-accent">
          {fact.year != null ? formatYear(fact.year) : "—"}
        </p>
        {dateWithoutYear && (
          <p className="mt-1 text-sm text-muted">{dateWithoutYear}</p>
        )}
      </div>
      <div className="mt-2 space-y-2 sm:mt-0 sm:pl-6">
        {fact.region && <p className="eyebrow text-muted">{fact.region}</p>}
        {fact.title && <h3 className="font-serif text-xl">{fact.title}</h3>}
        <Markdown className="leading-relaxed text-ink/80">{fact.fact}</Markdown>
        {fact.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fact.imageUrl}
            alt=""
            loading="lazy"
            className="max-h-64 rounded-lg object-cover"
          />
        )}
        <Source fact={fact} />
      </div>
    </article>
  );
}
