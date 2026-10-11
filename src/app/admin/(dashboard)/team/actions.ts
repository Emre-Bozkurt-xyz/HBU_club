"use server";

import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { execs } from "@/db/schema";
import {
  deleteImageIfUnused,
  moveRow,
  nextSortOrder,
  refreshSite,
} from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import {
  checkbox,
  optionalEmail,
  optionalId,
  optionalText,
  optionalUrl,
  parseForm,
  requiredText,
  type FormState,
} from "@/lib/forms";

const execSchema = z.object({
  name: requiredText("Name"),
  pronouns: optionalText,
  role: requiredText("Role"),
  program: optionalText,
  year: optionalText,
  school: optionalText,
  bio: optionalText,
  email: optionalEmail,
  instagram: optionalText,
  linkedin: optionalUrl,
  chapterId: optionalId,
  photoId: optionalId,
  term: optionalText,
  active: checkbox,
});

/** Execs are ordered within their chapter (and current/past group). */
function scopeOf(exec: { chapterId: string | null; active: boolean }) {
  return and(
    exec.chapterId
      ? eq(execs.chapterId, exec.chapterId)
      : isNull(execs.chapterId),
    eq(execs.active, exec.active),
  );
}

export async function createExec(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(execSchema, formData);
  if (!parsed.ok) return parsed.state;
  const sortOrder = await nextSortOrder(execs, scopeOf(parsed.data));
  const [row] = await db
    .insert(execs)
    .values({ ...parsed.data, sortOrder })
    .returning({ id: execs.id });
  refreshSite();
  redirect(`/admin/team/${row.id}?flash=created`);
}

export async function updateExec(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(execSchema, formData);
  if (!parsed.ok) return parsed.state;
  const [before] = await db.select().from(execs).where(eq(execs.id, id));
  if (!before)
    return { status: "error", message: "This person no longer exists." };

  const movedGroup =
    before.chapterId !== parsed.data.chapterId ||
    before.active !== parsed.data.active;
  const sortOrder = movedGroup
    ? await nextSortOrder(execs, scopeOf(parsed.data))
    : before.sortOrder;

  await db
    .update(execs)
    .set({ ...parsed.data, sortOrder, updatedAt: new Date() })
    .where(eq(execs.id, id));
  if (before.photoId !== parsed.data.photoId) {
    await deleteImageIfUnused(before.photoId);
  }
  refreshSite();
  return { status: "success", message: "Profile saved" };
}

export async function moveExec(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = formData.get("direction") === "up" ? "up" : "down";
  const [exec] = await db.select().from(execs).where(eq(execs.id, id));
  if (!exec) return;
  await moveRow(execs, id, direction, scopeOf(exec));
  refreshSite();
}

export async function deleteExec(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const [row] = await db
    .delete(execs)
    .where(eq(execs.id, id))
    .returning({ photoId: execs.photoId });
  await deleteImageIfUnused(row?.photoId);
  refreshSite();
  redirect("/admin/team?flash=deleted");
}
