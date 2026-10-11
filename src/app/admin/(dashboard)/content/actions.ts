"use server";

import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { faqs, links, pillars, siteContent } from "@/db/schema";
import { moveRow, nextSortOrder, refreshSite } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import {
  optionalId,
  optionalText,
  optionalUrl,
  parseForm,
  requiredText,
  type FormState,
} from "@/lib/forms";
import { PLATFORMS } from "@/lib/links";
import {
  SITE_CONTENT_FIELDS,
  SITE_CONTENT_KEYS,
} from "@/lib/site-content-fields";

const siteContentSchema = z.object(
  Object.fromEntries(
    SITE_CONTENT_KEYS.map((key) => [
      key,
      SITE_CONTENT_FIELDS[key].type === "url" ? optionalUrl : optionalText,
    ]),
  ) as Record<(typeof SITE_CONTENT_KEYS)[number], typeof optionalText>,
);

export async function updateSiteContent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(siteContentSchema, formData);
  if (!parsed.ok) return parsed.state;

  const entries = Object.entries(parsed.data) as [string, string | null][];
  const filled = entries.filter(([, v]) => v !== null) as [string, string][];
  const cleared = entries.filter(([, v]) => v === null).map(([k]) => k);

  await db.transaction(async (tx) => {
    // A blank field falls back to the built-in default.
    if (cleared.length) {
      await tx.delete(siteContent).where(inArray(siteContent.key, cleared));
    }
    for (const [key, value] of filled) {
      await tx
        .insert(siteContent)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteContent.key, set: { value } });
    }
  });
  refreshSite();
  return { status: "success", message: "Site content saved" };
}

// --- Repeating lists: "What we do" cards, FAQ, contact links -------------

const pillarSchema = z.object({
  id: optionalId,
  title: requiredText("Title"),
  body: requiredText("Text"),
});

export async function savePillar(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(pillarSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;
  if (id) await db.update(pillars).set(data).where(eq(pillars.id, id));
  else
    await db
      .insert(pillars)
      .values({ ...data, sortOrder: await nextSortOrder(pillars) });
  refreshSite();
  return { status: "success", message: id ? "Card saved" : "Card added" };
}

const faqSchema = z.object({
  id: optionalId,
  question: requiredText("Question"),
  answer: requiredText("Answer"),
});

export async function saveFaq(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(faqSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;
  if (id) await db.update(faqs).set(data).where(eq(faqs.id, id));
  else
    await db
      .insert(faqs)
      .values({ ...data, sortOrder: await nextSortOrder(faqs) });
  refreshSite();
  return {
    status: "success",
    message: id ? "Question saved" : "Question added",
  };
}

const linkSchema = z
  .object({
    id: optionalId,
    platform: z.enum(Object.keys(PLATFORMS) as [string, ...string[]]),
    url: requiredText("Link"),
    label: optionalText,
  })
  .superRefine((data, ctx) => {
    if (
      data.platform === "email" &&
      !z.email().safeParse(data.url.replace(/^mailto:/, "")).success
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Enter a valid email address.",
      });
    }
  });

export async function saveLink(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(linkSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;
  if (id) await db.update(links).set(data).where(eq(links.id, id));
  else
    await db
      .insert(links)
      .values({ ...data, sortOrder: await nextSortOrder(links) });
  refreshSite();
  return { status: "success", message: id ? "Link saved" : "Link added" };
}

const TABLES = { pillars, faqs, links };

function tableFrom(formData: FormData) {
  const name = String(formData.get("list")) as keyof typeof TABLES;
  const table = TABLES[name];
  if (!table) throw new Error("Unknown list.");
  return table;
}

export async function moveListItem(formData: FormData) {
  await requireAdmin();
  const direction = formData.get("direction") === "up" ? "up" : "down";
  await moveRow(tableFrom(formData), String(formData.get("id")), direction);
  refreshSite();
}

export async function deleteListItem(formData: FormData) {
  await requireAdmin();
  const table = tableFrom(formData);
  await db.delete(table).where(eq(table.id, String(formData.get("id"))));
  refreshSite();
}
