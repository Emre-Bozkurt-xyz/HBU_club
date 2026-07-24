"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { execs } from "@/db/schema";

function parseExecForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  if (!name) throw new Error("Name is required.");
  if (!role) throw new Error("Role is required.");

  const bioRaw = String(formData.get("bio") ?? "").trim();

  return {
    name,
    role,
    bio: bioRaw.length ? bioRaw : null,
  };
}

export async function createExec(formData: FormData) {
  const data = parseExecForm(formData);
  await db.insert(execs).values(data);
  revalidatePath("/admin/execs");
  revalidatePath("/execs");
}

export async function updateExec(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing exec id.");
  const data = parseExecForm(formData);
  await db.update(execs).set(data).where(eq(execs.id, id));
  revalidatePath("/admin/execs");
  revalidatePath("/execs");
}

export async function deleteExec(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing exec id.");
  await db.delete(execs).where(eq(execs.id, id));
  revalidatePath("/admin/execs");
  revalidatePath("/execs");
}
