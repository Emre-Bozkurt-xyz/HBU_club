"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(password))) {
    return { error: "Incorrect password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

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
  revalidatePath("/admin");
  revalidatePath("/events");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing event id.");
  const data = parseEventForm(formData);
  await db
    .update(events)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(events.id, id));
  revalidatePath("/admin");
  revalidatePath("/events");
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing event id.");
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin");
  revalidatePath("/events");
}
