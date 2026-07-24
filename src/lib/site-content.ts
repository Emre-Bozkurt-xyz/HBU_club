import { db } from "@/db";
import { siteContent } from "@/db/schema";

export type SiteContentKey =
  | "intro"
  | "contact_email"
  | "contact_instagram"
  | "contact_discord"
  | "meeting_info";

export type SiteContentFieldType = "text" | "email" | "textarea";

/** Known siteContent keys, in the order they should render in the admin form. */
export const SITE_CONTENT_FIELDS: {
  key: SiteContentKey;
  label: string;
  type: SiteContentFieldType;
}[] = [
  { key: "intro", label: "Intro paragraph (\"what we do\")", type: "textarea" },
  { key: "contact_email", label: "Contact email", type: "email" },
  { key: "contact_instagram", label: "Instagram", type: "text" },
  { key: "contact_discord", label: "Discord invite (optional)", type: "text" },
  { key: "meeting_info", label: "Meeting info (where/when)", type: "textarea" },
];

/** Fallback copy used until an exec fills in the real values via /admin/content. */
export const SITE_CONTENT_DEFAULTS: Record<SiteContentKey, string> = {
  intro:
    "We're a student history club exploring the land we live on and the stories that shaped the wider world. Talks, trivia, field trips, and good conversation — no prior knowledge required.",
  contact_email: "",
  contact_instagram: "",
  contact_discord: "",
  meeting_info: "",
};

/** Reads all siteContent rows into a fully-populated, defaulted object. */
export async function getSiteContent(): Promise<Record<SiteContentKey, string>> {
  const rows = await db.select().from(siteContent);
  const values: Record<SiteContentKey, string> = { ...SITE_CONTENT_DEFAULTS };
  for (const row of rows) {
    if (row.key in values) {
      values[row.key as SiteContentKey] = row.value;
    }
  }
  return values;
}
