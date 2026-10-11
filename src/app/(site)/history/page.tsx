import type { Metadata } from "next";
import { TimelineEntry } from "@/components/fact-card";
import { FilterChip, PageHeader } from "@/components/section-heading";
import type { Fact } from "@/db/schema";
import { centuryLabel, MONTH_NAMES, today } from "@/lib/format";
import { getPublishedFacts, sortChronologically } from "@/lib/queries";
import { toFactCard } from "@/lib/view";

export const metadata: Metadata = {
  title: "History",
  description: "A timeline of moments from local and world history.",
};

type View = "timeline" | "calendar";

function groupBy<T>(list: T[], key: (item: T) => string) {
  const groups = new Map<string, T[]>();
  for (const item of list) {
    const k = key(item);
    groups.set(k, [...(groups.get(k) ?? []), item]);
  }
  return groups;
}

function query(params: { view?: View; region?: string }) {
  const sp = new URLSearchParams();
  if (params.view && params.view !== "timeline") sp.set("view", params.view);
  if (params.region) sp.set("region", params.region);
  const s = sp.toString();
  return s ? `/history?${s}` : "/history";
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; region?: string }>;
}) {
  const sp = await searchParams;
  const view: View = sp.view === "calendar" ? "calendar" : "timeline";
  const all = await getPublishedFacts();
  const regions = [
    ...new Set(all.map((f) => f.region).filter(Boolean)),
  ].sort() as string[];
  const region = regions.includes(sp.region ?? "") ? sp.region : undefined;
  const list = sortChronologically(
    region ? all.filter((f) => f.region === region) : all,
  );

  let groups: Map<string, Fact[]>;
  if (view === "calendar") {
    const currentMonth = today().month;
    const byMonth = [...list].sort(
      (a, b) =>
        (a.month ?? 13) - (b.month ?? 13) ||
        (a.day ?? 0) - (b.day ?? 0) ||
        (a.year ?? 0) - (b.year ?? 0),
    );
    groups = groupBy(byMonth, (f) =>
      f.month
        ? `${MONTH_NAMES[f.month - 1]}${f.month === currentMonth ? " · this month" : ""}`
        : "Any time of year",
    );
  } else {
    groups = groupBy(list, (f) =>
      f.year != null ? centuryLabel(f.year) : "Undated",
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
      <PageHeader eyebrow="History" title="The timeline">
        Moments from the history of the lands we live on and the wider world,
        collected by our members.
      </PageHeader>

      <div className="mb-14 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex rounded-full border border-line bg-card p-1 text-sm">
          {(["timeline", "calendar"] as const).map((v) => (
            <a
              key={v}
              href={query({ view: v, region })}
              className={`rounded-full px-4 py-1.5 capitalize transition ${
                view === v ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
              }`}
            >
              {v === "timeline" ? "By era" : "By month"}
            </a>
          ))}
        </div>
        {regions.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip href={query({ view })} active={!region}>
              All regions
            </FilterChip>
            {regions.map((r) => (
              <FilterChip
                key={r}
                href={query({ view, region: r })}
                active={region === r}
              >
                {r}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <p className="font-serif text-2xl text-muted">
          The archive is being written — check back soon.
        </p>
      ) : (
        <div className="space-y-16">
          {[...groups].map(([label, facts]) => (
            <section key={label}>
              <h2 className="mb-8 font-serif text-3xl">{label}</h2>
              <div className="relative">
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[5px] top-2 w-px bg-line sm:left-[151.5px]"
                />
                {facts.map((fact) => (
                  <TimelineEntry key={fact.id} fact={toFactCard(fact)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
