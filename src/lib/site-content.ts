import { db } from "@/db";
import { siteContent } from "@/db/schema";
import {
  SITE_CONTENT_DEFAULTS,
  type SiteContentKey,
  type SiteContentValues,
} from "./site-content-fields";

export * from "./site-content-fields";

/** Reads all siteContent rows into a fully-populated, defaulted object. */
export async function getSiteContent(): Promise<SiteContentValues> {
  const rows = await db.select().from(siteContent);
  const values: SiteContentValues = { ...SITE_CONTENT_DEFAULTS };
  for (const row of rows) {
    if (row.key in values) {
      values[row.key as SiteContentKey] = row.value;
    }
  }
  return values;
}
