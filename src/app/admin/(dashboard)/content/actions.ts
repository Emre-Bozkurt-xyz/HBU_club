"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { siteContent } from "@/db/schema";
import { SITE_CONTENT_FIELDS } from "@/lib/site-content";

export async function updateSiteContent(formData: FormData) {
  const rows = SITE_CONTENT_FIELDS.map(({ key }) => ({
    key,
    value: String(formData.get(key) ?? "").trim(),
  }));

  await db
    .insert(siteContent)
    .values(rows)
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value: sql`excluded.value` },
    });

  revalidatePath("/admin/content");
  revalidatePath("/");
}
