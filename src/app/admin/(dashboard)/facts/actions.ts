"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { facts } from "@/db/schema";

function parseFactForm(formData: FormData) {
  const fact = String(formData.get("fact") ?? "").trim();
  const monthRaw = String(formData.get("month") ?? "");
  const month = Number(monthRaw);
  if (!fact) throw new Error("Fact text is required.");
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  const sourceRaw = String(formData.get("source") ?? "").trim();

  return {
    fact,
    month,
    source: sourceRaw.length ? sourceRaw : null,
  };
}

export async function createFact(formData: FormData) {
  const data = parseFactForm(formData);
  await db.insert(facts).values(data);
  revalidatePath("/admin/facts");
  revalidatePath("/");
}

export async function updateFact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing fact id.");
  const data = parseFactForm(formData);
  await db.update(facts).set(data).where(eq(facts.id, id));
  revalidatePath("/admin/facts");
  revalidatePath("/");
}

export async function deleteFact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing fact id.");
  await db.delete(facts).where(eq(facts.id, id));
  revalidatePath("/admin/facts");
  revalidatePath("/");
}
