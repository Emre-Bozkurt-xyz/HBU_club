export const PLATFORMS = {
  email: { label: "Email", placeholder: "hello@example.com" },
  instagram: { label: "Instagram", placeholder: "@historybeforeus" },
  discord: { label: "Discord", placeholder: "https://discord.gg/..." },
  linkedin: { label: "LinkedIn", placeholder: "https://linkedin.com/..." },
  tiktok: { label: "TikTok", placeholder: "@historybeforeus" },
  youtube: { label: "YouTube", placeholder: "https://youtube.com/@..." },
  website: { label: "Website", placeholder: "https://..." },
} as const;

export type Platform = keyof typeof PLATFORMS;

export function isPlatform(value: string): value is Platform {
  return value in PLATFORMS;
}

const HANDLE_BASES: Partial<Record<Platform, string>> = {
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/@",
  linkedin: "https://linkedin.com/in/",
};

/**
 * Turn whatever an exec typed (an email, "@handle", a bare domain, a full URL)
 * into a working href.
 */
export function linkHref(platform: string, value: string) {
  const v = value.trim();
  if (platform === "email") {
    return v.startsWith("mailto:") ? v : `mailto:${v}`;
  }
  if (/^https?:\/\//i.test(v)) return v;
  const base = HANDLE_BASES[platform as Platform];
  if (base && !v.includes(".") && !v.includes("/")) {
    return base + v.replace(/^@/, "");
  }
  return `https://${v.replace(/^\/+/, "")}`;
}

/** Short human-readable text for a link, e.g. "@historybeforeus". */
export function linkDisplay(platform: string, value: string) {
  const v = value.trim();
  if (platform === "email") return v.replace(/^mailto:/, "");
  if (platform === "instagram" || platform === "tiktok") {
    const handle = v.match(/(?:instagram\.com|tiktok\.com)\/@?([^/?#]+)/i)?.[1];
    if (handle) return `@${handle}`;
    if (!v.includes("/")) return v.startsWith("@") ? v : `@${v}`;
  }
  return v.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}
