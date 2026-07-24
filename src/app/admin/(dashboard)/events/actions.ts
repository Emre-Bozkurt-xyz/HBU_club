"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";

function parseEventForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const eventDateRaw = String(formData.get("eventDate") ?? "");
  if (!title) throw new Error("Title is required.");
  if (!eventDateRaw) throw new Error("Date is required.");

  const trimOrNull = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s.length ? s : null;
  };

  return {
    title,
    theme: trimOrNull(formData.get("theme")),
    location: trimOrNull(formData.get("location")),
    description: trimOrNull(formData.get("description")),
    eventDate: new Date(eventDateRaw),
  };
}

export async function createEvent(formData: FormData) {
  const data = parseEventForm(formData);
  await db.insert(events).values(data);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing event id.");
  const data = parseEventForm(formData);
  await db
    .update(events)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing event id.");
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
