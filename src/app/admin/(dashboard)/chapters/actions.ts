"use server";

import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { moveRow, nextSortOrder, refreshSite } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import {
  checkbox,
  optionalEmail,
  optionalText,
  parseForm,
  requiredText,
  slugify,
  type FormState,
} from "@/lib/forms";

const chapterSchema = z
  .object({
    name: requiredText("Name"),
    slug: optionalText,
    institution: optionalText,
    city: optionalText,
    description: optionalText,
    email: optionalEmail,
    instagram: optionalText,
    meetingInfo: optionalText,
    published: checkbox,
  })
  .transform((data) => ({ ...data, slug: slugify(data.slug || data.name) }))
  .refine((data) => data.slug.length > 0, {
    path: ["slug"],
    message: "Use at least one letter or number.",
  });

async function slugTaken(slug: string, exceptId?: string) {
  const [row] = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(
      exceptId
        ? and(eq(chapters.slug, slug), ne(chapters.id, exceptId))
        : eq(chapters.slug, slug),
    );
  return Boolean(row);
}

const slugError: FormState = {
  status: "error",
  message: "Please fix the highlighted fields.",
  fieldErrors: { slug: "Another chapter already uses this web address." },
};

export async function createChapter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(chapterSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (await slugTaken(parsed.data.slug)) return slugError;
  const [row] = await db
    .insert(chapters)
    .values({ ...parsed.data, sortOrder: await nextSortOrder(chapters) })
    .returning({ id: chapters.id });
  refreshSite();
  redirect(`/admin/chapters/${row.id}?flash=created`);
}

export async function updateChapter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(chapterSchema, formData);
  if (!parsed.ok) return parsed.state;
  if (await slugTaken(parsed.data.slug, id)) return slugError;
  await db
    .update(chapters)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(chapters.id, id));
  refreshSite();
  return { status: "success", message: "Chapter saved" };
}

export async function moveChapter(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await moveRow(
    chapters,
    id,
    formData.get("direction") === "up" ? "up" : "down",
  );
  refreshSite();
}

export async function deleteChapter(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  // Execs and events in this chapter become organization-wide (FK: set null).
  await db.delete(chapters).where(eq(chapters.id, id));
  refreshSite();
  redirect("/admin/chapters?flash=deleted");
}
