"use server";

import { db } from "@/db";
import { images } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = ["image/webp", "image/jpeg", "image/png"];

export async function uploadImage(
  formData: FormData,
): Promise<{ id: string } | { error: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No image was received." };
  }
  if (!ALLOWED.includes(file.type)) {
    return { error: "Please upload a JPG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "That image is too large (max 3 MB after resizing)." };
  }
  const width = Number(formData.get("width")) || null;
  const height = Number(formData.get("height")) || null;

  const [row] = await db
    .insert(images)
    .values({
      data: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
      width,
      height,
    })
    .returning({ id: images.id });
  return { id: row.id };
}
