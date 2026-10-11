// Client-safe definitions of the editable site copy (no database imports).

export type SiteContentFieldType = "text" | "textarea" | "url";

type FieldDef = {
  label: string;
  type: SiteContentFieldType;
  help?: string;
  default: string;
  group: "hero" | "join" | "announcement";
};

/** Known siteContent keys, in the order they render in the admin form. */
export const SITE_CONTENT_FIELDS = {
  hero_eyebrow: {
    group: "hero",
    label: "Small line above the heading",
    type: "text",
    default: "A student-led history organization",
  },
  hero_heading: {
    group: "hero",
    label: "Main heading",
    type: "text",
    default: "The stories that shaped the places we call home.",
  },
  intro: {
    group: "hero",
    label: "Intro paragraph",
    type: "textarea",
    help: "Who you are and what you do, in two or three sentences.",
    default:
      "We're a student history club exploring the land we live on and the stories that shaped the wider world. Talks, trivia, field trips, and good conversation — no prior knowledge required.",
  },
  join_url: {
    group: "join",
    label: "Sign-up link",
    type: "url",
    help: "Where the “Join us” buttons go (e.g. a Google Form or club page). Leave blank to scroll to the contact section instead.",
    default: "",
  },
  join_text: {
    group: "join",
    label: "Get involved text",
    type: "textarea",
    default:
      "Membership is free and open to everyone. Follow along on social media, come to an event, or reach out — we'd love to meet you.",
  },
  meeting_info: {
    group: "join",
    label: "Where & when you meet",
    type: "textarea",
    help: "Organization-wide. Each chapter can also set its own meeting info.",
    default: "",
  },
  announcement: {
    group: "announcement",
    label: "Announcement banner",
    type: "text",
    help: "Shown in a bar at the very top of every page. Leave blank to hide it.",
    default: "",
  },
  announcement_url: {
    group: "announcement",
    label: "Announcement link (optional)",
    type: "url",
    default: "",
  },
} satisfies Record<string, FieldDef>;

export type SiteContentKey = keyof typeof SITE_CONTENT_FIELDS;
export type SiteContentValues = Record<SiteContentKey, string>;

export const SITE_CONTENT_KEYS = Object.keys(
  SITE_CONTENT_FIELDS,
) as SiteContentKey[];

export const SITE_CONTENT_DEFAULTS = Object.fromEntries(
  SITE_CONTENT_KEYS.map((key) => [key, SITE_CONTENT_FIELDS[key].default]),
) as SiteContentValues;
