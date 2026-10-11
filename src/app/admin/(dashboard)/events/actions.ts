"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { events } from "@/db/schema";
import { deleteImageIfUnused, refreshSite } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { fromDateTimeLocal } from "@/lib/format";
import {
  checkbox,
  optionalId,
  optionalText,
  optionalUrl,
  parseForm,
  requiredText,
  type FormState,
} from "@/lib/forms";

const localDateTime = (label: string) =>
  z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const date = fromDateTimeLocal(v);
      if (!date) {
        ctx.addIssue({
          code: "custom",
          message: `${label} isn't a valid date.`,
        });
        return z.NEVER;
      }
      return date;
    });

const eventSchema = z
  .object({
    title: requiredText("Title"),
    eventDate: localDateTime("Start"),
    endsAt: localDateTime("End"),
    theme: optionalText,
    location: optionalText,
    chapterId: optionalId,
    rsvpUrl: optionalUrl,
    description: optionalText,
    recap: optionalText,
    imageId: optionalId,
    published: checkbox,
  })
  .superRefine((data, ctx) => {
    if (!data.eventDate) {
      ctx.addIssue({
        code: "custom",
        path: ["eventDate"],
        message: "Start date & time is required.",
      });
    } else if (data.endsAt && data.endsAt <= data.eventDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "End must be after the start.",
      });
    }
  })
  .transform((data) => ({ ...data, eventDate: data.eventDate! }));

export async function createEvent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(eventSchema, formData);
  if (!parsed.ok) return parsed.state;
  const [row] = await db
    .insert(events)
    .values(parsed.data)
    .returning({ id: events.id });
  refreshSite();
  redirect(`/admin/events/${row.id}?flash=created`);
}

export async function updateEvent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseForm(eventSchema, formData);
  if (!parsed.ok) return parsed.state;
  const [before] = await db
    .select({ imageId: events.imageId })
    .from(events)
    .where(eq(events.id, id));
  if (!before)
    return { status: "error", message: "This event no longer exists." };
  await db
    .update(events)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(events.id, id));
  if (before.imageId !== parsed.data.imageId) {
    await deleteImageIfUnused(before.imageId);
  }
  refreshSite();
  return { status: "success", message: "Event saved" };
}

export async function duplicateEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const [source] = await db.select().from(events).where(eq(events.id, id));
  if (!source) redirect("/admin/events");
  const { id: _id, createdAt: _c, updatedAt: _u, ...copy } = source;
  const [row] = await db
    .insert(events)
    .values({
      ...copy,
      title: `${source.title} (copy)`,
      recap: null,
      published: false,
    })
    .returning({ id: events.id });
  refreshSite();
  redirect(`/admin/events/${row.id}?flash=duplicated`);
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const [row] = await db
    .delete(events)
    .where(eq(events.id, id))
    .returning({ imageId: events.imageId });
  await deleteImageIfUnused(row?.imageId);
  refreshSite();
  redirect("/admin/events?flash=deleted");
}
