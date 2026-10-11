import { revalidatePath } from "next/cache";
import { asc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  chapters,
  events,
  execs,
  facts,
  faqs,
  images,
  links,
  pillars,
} from "@/db/schema";

/** Refresh every cached page after an admin edit. */
export function refreshSite() {
  revalidatePath("/", "layout");
}

/**
 * Delete an image once nothing points at it any more (e.g. after a photo is
 * replaced). Duplicated events can share an image, so check before deleting.
 */
export async function deleteImageIfUnused(id: string | null | undefined) {
  if (!id) return;
  const [{ used }] = await db.execute<{ used: boolean }>(sql`
    SELECT EXISTS (SELECT 1 FROM ${events} WHERE ${events.imageId} = ${id})
        OR EXISTS (SELECT 1 FROM ${execs} WHERE ${execs.photoId} = ${id})
        OR EXISTS (SELECT 1 FROM ${facts} WHERE ${facts.imageId} = ${id})
      AS used`);
  if (!used) await db.delete(images).where(eq(images.id, id));
}

type Sortable =
  | typeof chapters
  | typeof execs
  | typeof faqs
  | typeof links
  | typeof pillars;

/**
 * Move a row one place up or down within its list (optionally a sub-list,
 * e.g. execs in one chapter), renumbering the list so orders stay tidy.
 */
export async function moveRow(
  table: Sortable,
  id: string,
  direction: "up" | "down",
  scope?: SQL,
) {
  const rows: { id: string }[] = await db
    .select({ id: table.id })
    .from(table as typeof pillars)
    .where(scope)
    .orderBy(asc(table.sortOrder), asc(table.id));
  const index = rows.findIndex((r) => r.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await db.transaction(async (tx) => {
    for (const [order, row] of rows.entries()) {
      await tx
        .update(table as typeof pillars)
        .set({ sortOrder: order })
        .where(eq((table as typeof pillars).id, row.id));
    }
  });
}

/** Next sort position at the end of a list. */
export async function nextSortOrder(table: Sortable, scope?: SQL) {
  const [row] = await db
    .select({ max: sql<number | null>`max(${table.sortOrder})` })
    .from(table as typeof pillars)
    .where(scope);
  return (row?.max ?? -1) + 1;
}
