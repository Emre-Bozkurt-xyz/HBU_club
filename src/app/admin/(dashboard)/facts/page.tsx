import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { db } from "@/db";
import { facts } from "@/db/schema";
import { excerpt } from "@/components/markdown";
import { formatHistoricalDate, MONTH_NAMES, today } from "@/lib/format";
import { sortChronologically } from "@/lib/queries";
import {
  AdminPageHeader,
  Badge,
  buttonClass,
  EmptyState,
} from "../../_components/ui";

export default async function AdminFactsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const all = await db.select().from(facts);
  const currentMonth = today().month;
  const filterMonth =
    monthParam === "none"
      ? "none"
      : Number(monthParam) >= 1 && Number(monthParam) <= 12
        ? Number(monthParam)
        : null;

  const counts = MONTH_NAMES.map(
    (_, i) => all.filter((f) => f.month === i + 1 && f.published).length,
  );
  const noMonth = all.filter((f) => !f.month).length;
  const list = sortChronologically(
    filterMonth === null
      ? all
      : filterMonth === "none"
        ? all.filter((f) => !f.month)
        : all.filter((f) => f.month === filterMonth),
  );

  const newHref =
    typeof filterMonth === "number"
      ? `/admin/facts/new?month=${filterMonth}`
      : "/admin/facts/new";

  return (
    <>
      <AdminPageHeader
        title="History facts"
        description="Facts power the “Today in history” section of the home page and the public timeline. Aim for a few in every month so the home page always has something current."
        actions={
          <Link href={newHref} className={buttonClass.primary}>
            <Plus className="size-4" /> Add fact
          </Link>
        }
      />

      <section className="mb-8">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {MONTH_NAMES.map((name, i) => {
            const month = i + 1;
            const count = counts[i];
            const active = filterMonth === month;
            return (
              <Link
                key={name}
                href={active ? "/admin/facts" : `/admin/facts?month=${month}`}
                className={`rounded-lg border px-2 py-2.5 text-center transition ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : count === 0
                      ? "border-dashed border-amber-400 bg-amber-50 hover:border-amber-600"
                      : "border-line bg-card hover:border-ink/30"
                } ${month === currentMonth && !active ? "ring-2 ring-accent/40" : ""}`}
                title={`${count} published fact${count === 1 ? "" : "s"} in ${name}`}
              >
                <p
                  className={`text-xs ${active ? "text-paper/70" : "text-muted"}`}
                >
                  {name.slice(0, 3)}
                </p>
                <p className="font-serif text-xl leading-tight">{count}</p>
              </Link>
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>
            <span className="mr-1 inline-block size-2.5 rounded-sm border border-dashed border-amber-400 bg-amber-50 align-middle" />
            Empty month — the home page will fall back to a fact from another
            month
          </span>
          {noMonth > 0 && (
            <Link
              href="/admin/facts?month=none"
              className="underline underline-offset-2 hover:text-ink"
            >
              {noMonth} without a month
            </Link>
          )}
          {filterMonth !== null && (
            <Link
              href="/admin/facts"
              className="underline underline-offset-2 hover:text-ink"
            >
              Show all
            </Link>
          )}
        </div>
      </section>

      {list.length === 0 ? (
        <EmptyState
          title={
            typeof filterMonth === "number"
              ? `No facts for ${MONTH_NAMES[filterMonth - 1]} yet`
              : "No facts yet"
          }
        >
          <Link href={newHref} className="text-accent hover:underline">
            Add one →
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
          {list.map((fact) => (
            <li key={fact.id}>
              <Link
                href={`/admin/facts/${fact.id}`}
                className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-paper/60"
              >
                <div className="w-36 shrink-0 text-sm font-medium text-accent">
                  {formatHistoricalDate(fact) || "Undated"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {fact.title || excerpt(fact.fact, 90)}
                  </p>
                  {fact.title && (
                    <p className="truncate text-sm text-muted">
                      {excerpt(fact.fact, 120)}
                    </p>
                  )}
                </div>
                <div className="hidden shrink-0 gap-1.5 sm:flex">
                  {fact.region && <Badge>{fact.region}</Badge>}
                  {!fact.published && <Badge tone="warning">Hidden</Badge>}
                </div>
                <ChevronRight className="size-4 shrink-0 text-ink/30" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
